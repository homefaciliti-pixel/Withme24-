import { Response } from 'express';
import { KYCVerification, CompanionProfile } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { getStorageService } from '../services/storage';

export class KYCController {
  /**
   * POST /api/kyc
   * Submits KYC verification request. Expects multer files document_front, document_back, selfie.
   */
  public static async submitKYC(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const { document_type } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.document_front || !files.selfie) {
      return res.status(400).json({
        success: false,
        message: 'Both front document scan and selfie are required for verification',
        error: { code: 'MISSING_REQUIRED_FILES' },
      });
    }

    try {
      const storageService = getStorageService();

      // Upload files securely
      const frontUrl = await storageService.uploadFile(files.document_front[0]);
      const selfieUrl = await storageService.uploadFile(files.selfie[0]);
      let backUrl = null;

      if (files.document_back && files.document_back.length > 0) {
        backUrl = await storageService.uploadFile(files.document_back[0]);
      }

      // Check if there is already a KYC verification row
      let kyc = await KYCVerification.findOne({ where: { user_id: user.id } });

      if (kyc) {
        await kyc.update({
          document_type,
          document_status: 'PENDING',
          document_front_url: frontUrl,
          document_back_url: backUrl,
          selfie_url: selfieUrl,
          rejection_reason: null,
          submitted_at: new Date(),
        });
      } else {
        kyc = await KYCVerification.create({
          user_id: user.id,
          document_type,
          document_status: 'PENDING',
          document_front_url: frontUrl,
          document_back_url: backUrl,
          selfie_url: selfieUrl,
          submitted_at: new Date(),
        });
      }

      // Automatically sync companion profile state if exists, otherwise create it as PENDING
      let profile = await CompanionProfile.findOne({ where: { user_id: user.id } });
      if (profile) {
        await profile.update({ verification_status: 'PENDING' });
      } else {
        await CompanionProfile.create({
          user_id: user.id,
          verification_status: 'PENDING',
          profile_visibility: 'PRIVATE',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'KYC documents submitted successfully for administrative review',
        data: { status: 'PENDING' },
      });
    } catch (error) {
      console.error('KYC Submission Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/kyc/status
   */
  public static async getStatus(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;

    try {
      const kyc = await KYCVerification.findOne({ where: { user_id: user.id } });
      if (!kyc) {
        return res.status(200).json({ success: true, data: { status: 'NOT_STARTED' } });
      }

      return res.status(200).json({
        success: true,
        data: {
          status: kyc.document_status,
          rejection_reason: kyc.rejection_reason,
          submitted_at: kyc.submitted_at,
          reviewed_at: kyc.reviewed_at,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/kyc/documents
   * Exposes temporary, secure signed URLs for users to preview their uploaded files.
   */
  public static async getDocuments(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;

    try {
      const kyc = await KYCVerification.findOne({ where: { user_id: user.id } });
      if (!kyc) {
        return res.status(404).json({ success: false, message: 'No KYC documents uploaded yet' });
      }

      const storageService = getStorageService();
      const frontSigned = await storageService.getSignedUrl(kyc.document_front_url);
      const selfieSigned = await storageService.getSignedUrl(kyc.selfie_url);
      const backSigned = kyc.document_back_url
        ? await storageService.getSignedUrl(kyc.document_back_url)
        : null;

      return res.status(200).json({
        success: true,
        data: {
          document_type: kyc.document_type,
          document_front: frontSigned,
          document_back: backSigned,
          selfie: selfieSigned,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
