import { Response } from 'express';
import {
  sequelize,
  User,
  CompanionProfile,
  KYCVerification,
  Booking,
  Report,
  Payout,
  Wallet,
  Transaction,
  AuditLog,
  ModerationCase,
  ModerationAction,
} from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuditService } from '../services/audit';
import { NotificationService } from '../services/notification';

export class AdminController {
  /**
   * GET /api/admin/analytics
   */
  public static async getAnalytics(_req: AuthenticatedRequest, res: Response) {
    try {
      const totalUsers = await User.count();
      const totalCompanions = await User.count({ where: { role: 'COMPANION' } });
      const verifiedCompanions = await CompanionProfile.count({ where: { verification_status: 'VERIFIED' } });
      const pendingKYC = await KYCVerification.count({ where: { document_status: 'PENDING' } });
      
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = await Booking.count({ where: { booking_date: today } });
      const completedBookings = await Booking.count({ where: { status: 'COMPLETED' } });
      const cancelledBookings = await Booking.count({ where: { status: 'CANCELLED' } });

      const financialMetrics = await Booking.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
          [sequelize.fn('SUM', sequelize.col('platform_fee')), 'commission'],
        ],
        where: { payment_status: 'PAID' },
      });

      const totalRevenue = parseFloat(financialMetrics[0]?.getDataValue('revenue') || 0.00);
      const totalCommission = parseFloat(financialMetrics[0]?.getDataValue('commission') || 0.00);
      const companionEarnings = totalRevenue - totalCommission;

      const pendingPayouts = await Payout.count({ where: { status: 'PENDING' } });
      const openReports = await Report.count({ where: { status: 'OPEN' } });

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalCompanions,
          verifiedCompanions,
          pendingKYC,
          todayBookings,
          completedBookings,
          cancelledBookings,
          totalRevenue,
          totalCommission,
          companionEarnings,
          pendingPayouts,
          openReports,
        },
      });
    } catch (error) {
      console.error('Analytics Fetch Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/admin/kyc
   */
  public static async getPendingKYCs(_req: AuthenticatedRequest, res: Response) {
    try {
      const submissions = await KYCVerification.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'mobile', 'email'] }],
        order: [['submitted_at', 'ASC']],
      });
      return res.status(200).json({ success: true, data: submissions });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/admin/kyc/:id/review
   * Verify or reject companion identity papers.
   */
  public static async reviewKYC(req: AuthenticatedRequest, res: Response) {
    const kycId = parseInt(req.params.id, 10);
    const { status, rejection_reason } = req.body; // VERIFIED, REJECTED
    const admin = req.user!;

    try {
      const kyc = await KYCVerification.findByPk(kycId);
      if (!kyc) return res.status(404).json({ success: false, message: 'KYC submission records not found' });

      const companionUser = await User.findByPk(kyc.user_id);
      const profile = await CompanionProfile.findOne({ where: { user_id: kyc.user_id } });

      if (!companionUser || !profile) {
        return res.status(404).json({ success: false, message: 'Companion account or profile missing' });
      }

      const oldKyc = { ...kyc.toJSON() };

      await sequelize.transaction(async (t) => {
        // Update KYC Verification Record
        await kyc.update(
          {
            document_status: status,
            rejection_reason: status === 'REJECTED' ? rejection_reason : null,
            reviewed_by: admin.id,
            reviewed_at: new Date(),
          },
          { transaction: t }
        );

        // Update User & Companion states
        if (status === 'VERIFIED') {
          await companionUser.update({ is_18_plus_verified: true, role: 'COMPANION' }, { transaction: t });
          await profile.update({ verification_status: 'VERIFIED', profile_visibility: 'PUBLIC' }, { transaction: t });
          
          // Seed Wallet if missing
          const existingWallet = await Wallet.findOne({ where: { companion_id: profile.id }, transaction: t });
          if (!existingWallet) {
            await Wallet.create({ companion_id: profile.id }, { transaction: t });
          }
        } else {
          await profile.update({ verification_status: 'REJECTED', profile_visibility: 'PRIVATE' }, { transaction: t });
        }

        // Log audit trail
        await AuditService.logAction({
          adminId: admin.id,
          action: `REVIEW_KYC_${status}`,
          entityType: 'kyc_verification',
          entityId: kyc.id,
          oldValue: oldKyc,
          newValue: kyc,
        });
      });

      // Send status SMS / In-App alerts in background
      await NotificationService.sendNotification({
        userId: companionUser.id,
        templateKey: status === 'VERIFIED' ? 'booking_confirmed' : 'otp_sent', // fallback tags or custom
        variables: {
          user_name: companionUser.name || 'Companion',
          otp_code: `KYC ${status.toLowerCase()}`, // quick mock payload
        },
      });

      return res.status(200).json({ success: true, message: `KYC successfully review: marked as ${status}` });
    } catch (error) {
      console.error('Review KYC Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/admin/reports
   */
  public static async getReports(_req: AuthenticatedRequest, res: Response) {
    try {
      const cases = await ModerationCase.findAll({
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'account_status'] },
          { model: Report, as: 'report', include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }] },
        ],
        order: [['created_at', 'DESC']],
      });
      return res.status(200).json({ success: true, data: cases });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/admin/reports/:id/resolve
   * Moderate flagged users (resolve report, warn, suspend or ban).
   */
  public static async resolveReport(req: AuthenticatedRequest, res: Response) {
    const caseId = parseInt(req.params.id, 10);
    const { action, duration_days, reason } = req.body; // WARN, SUSPEND, BAN, RESTORE, CONTENT_REMOVAL
    const admin = req.user!;

    try {
      const modCase = await ModerationCase.findByPk(caseId);
      if (!modCase) return res.status(404).json({ success: false, message: 'Moderation case not found' });

      const targetUser = await User.findByPk(modCase.user_id);
      if (!targetUser) return res.status(404).json({ success: false, message: 'Target user account not found' });

      await sequelize.transaction(async (t) => {
        // Log action log
        await ModerationAction.create(
          {
            case_id: modCase.id,
            action_type: action,
            reason,
            duration_days: duration_days || null,
            performed_by: admin.id,
          },
          { transaction: t }
        );

        // Update target account state
        if (action === 'BAN') {
          await targetUser.update({ account_status: 'BANNED' }, { transaction: t });
        } else if (action === 'SUSPEND') {
          await targetUser.update({ account_status: 'SUSPENDED' }, { transaction: t });
        } else if (action === 'RESTORE') {
          await targetUser.update({ account_status: 'ACTIVE' }, { transaction: t });
        }

        // Complete the case
        await modCase.update({ status: 'RESOLVED', assigned_to: admin.id }, { transaction: t });

        // Update reporting state if exists
        if (modCase.report_id) {
          await Report.update(
            { status: 'RESOLVED', reviewed_by: admin.id, reviewed_at: new Date(), action_taken: `${action}: ${reason}` },
            { where: { id: modCase.report_id }, transaction: t }
          );
        }

        await AuditService.logAction({
          adminId: admin.id,
          action: `MODERATION_${action}`,
          entityType: 'user',
          entityId: targetUser.id,
          newValue: { action, reason },
        });
      });

      return res.status(200).json({ success: true, message: `Case resolved. User marked as ${action}` });
    } catch (error) {
      console.error('Resolve Report Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/admin/payouts
   */
  public static async getPayouts(_req: AuthenticatedRequest, res: Response) {
    try {
      const payouts = await Payout.findAll({
        include: [
          {
            model: Wallet,
            as: 'wallet',
            include: [{ model: CompanionProfile, as: 'companion', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] }],
          },
        ],
        order: [['created_at', 'DESC']],
      });
      return res.status(200).json({ success: true, data: payouts });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/admin/payouts/:id/approve
   * Settle pending payouts requested by companions.
   */
  public static async approvePayout(req: AuthenticatedRequest, res: Response) {
    const payoutId = parseInt(req.params.id, 10);
    const { status, bank_reference } = req.body; // SUCCESS, REJECTED
    const admin = req.user!;

    try {
      const payout = await Payout.findByPk(payoutId, {
        include: [{ model: Wallet, as: 'wallet' }],
      });

      if (!payout) return res.status(404).json({ success: false, message: 'Payout request not found' });
      if (payout.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Only PENDING payouts can be updated' });
      }

      const wallet = payout.wallet;

      await sequelize.transaction(async (t) => {
        if (status === 'SUCCESS') {
          // Verify available balances
          const available = parseFloat(wallet.available_balance.toString());
          const payoutAmount = parseFloat(payout.amount.toString());

          if (available < payoutAmount) {
            throw new Error('INSUFFICIENT_BALANCE');
          }

          // Deduct from wallet available pool
          await wallet.update(
            {
              available_balance: available - payoutAmount,
            },
            { transaction: t }
          );

          await payout.update(
            {
              status: 'SUCCESS',
              bank_reference,
              processed_at: new Date(),
            },
            { transaction: t }
          );

          // Log transaction ledger record
          await Transaction.create(
            {
              user_id: wallet.id, // reference wallet ID
              transaction_type: 'PAYOUT',
              amount: -payoutAmount,
              currency: 'INR',
              status: 'SUCCESS',
              reference: bank_reference,
            },
            { transaction: t }
          );
        } else {
          // Rejected - restore pending balance or mark rejected
          await payout.update(
            {
              status: 'REJECTED',
              processed_at: new Date(),
            },
            { transaction: t }
          );
        }

        await AuditService.logAction({
          adminId: admin.id,
          action: `PAYOUT_${status}`,
          entityType: 'payout',
          entityId: payout.id,
          newValue: { status, bank_reference },
        });
      });

      return res.status(200).json({ success: true, message: `Payout request processed: marked as ${status}` });
    } catch (error: any) {
      console.error('Payout Approval Error:', error);
      if (error.message === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({ success: false, message: 'Companion does not have enough available balance to payout.' });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/admin/audit-logs
   */
  public static async getAuditLogs(_req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await AuditLog.findAll({
        include: [{ model: User, as: 'admin', attributes: ['id', 'name', 'role'] }],
        order: [['created_at', 'DESC']],
        limit: 100,
      });
      return res.status(200).json({ success: true, data: logs });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
