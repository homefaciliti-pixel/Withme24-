import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/authController';
import { MetadataController } from '../controllers/metadataController';
import { CompanionController } from '../controllers/companionController';
import { BookingController } from '../controllers/bookingController';
import { PaymentController } from '../controllers/paymentController';
import { KYCController } from '../controllers/kycController';
import { SafetyController } from '../controllers/safetyController';
import { AdminController } from '../controllers/adminController';
import { NotificationController } from '../controllers/notificationController';
import { HealthController } from '../controllers/healthController';
import swaggerRouter from '../config/swagger';

import { getStorageService } from '../services/storage';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

// Middlewares
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validate } from '../middleware/validate';
import {
  apiLimiter,
  otpLimiter,
  loginLimiter,
  bookingLimiter,
  uploadLimiter,
} from '../middleware/rateLimiter';

// Validation Schemas
import {
  sendOtpSchema,
  verifyOtpSchema,
  kycSubmitSchema,
  kycReviewSchema,
  bookingCreateSchema,
  paymentVerifySchema,
  bookingStatusUpdateSchema,
  reviewSubmitSchema,
  reportSubmitSchema,
  blockUserSchema,
  emergencyTriggerSchema,
  activityAdminSchema,
  cityAdminSchema,
} from '../utils/validation';

const router = Router();

// Configure Multer for secure KYC uploads (memory-buffer storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = allowedTypes.test(file.originalname.toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Only PDF, JPG, JPEG, and PNG are allowed.'));
    }
  },
});

const kycUploadFields = upload.fields([
  { name: 'document_front', maxCount: 1 },
  { name: 'document_back', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

// ==========================================
// 1. HEALTH CHECK & METADATA
// ==========================================
router.get('/health', HealthController.checkHealth);
router.use(swaggerRouter);
router.get('/cities', apiLimiter, MetadataController.getCities);
router.get('/activities', apiLimiter, MetadataController.getActivities);

router.post('/upload', authenticate, uploadLimiter, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    const storageService = getStorageService();
    const fileUrl = await storageService.uploadFile(req.file);
    const backendUrl = `http://localhost:${process.env.PORT || 5000}`;
    const fullUrl = `${backendUrl}${fileUrl}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fullUrl,
        relativePath: fileUrl,
      },
    });
    return;
  } catch (err: any) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload file' });
    return;
  }
});

// ==========================================
// 2. AUTHENTICATION
// ==========================================
router.post('/auth/send-otp', otpLimiter, validate(sendOtpSchema), AuthController.sendOtp);
router.post('/auth/verify-otp', loginLimiter, validate(verifyOtpSchema), AuthController.verifyOtp);
router.post('/auth/refresh-token', apiLimiter, AuthController.refreshToken);
router.post('/auth/logout', apiLimiter, AuthController.logout);
router.get('/auth/me', authenticate, AuthController.me);
router.put('/users/profile', authenticate, AuthController.updateProfile);
router.get('/auth/sessions', authenticate, AuthController.getSessions);
router.post('/auth/sessions/logout-all', authenticate, AuthController.logoutAllSessions);

// ==========================================
// 3. COMPANIONS
// ==========================================
router.get('/companions', optionalAuthenticate, CompanionController.listCompanions);
router.get('/companions/:id', optionalAuthenticate, CompanionController.getCompanionDetail);
router.get('/companions/:id/availability', optionalAuthenticate, CompanionController.getAvailability);
router.get('/companions/:id/reviews', optionalAuthenticate, CompanionController.getReviews);
router.post('/reviews', authenticate, validate(reviewSubmitSchema), CompanionController.submitReview);

// Companion Profile Management (self)
router.post('/companions/profile', authenticate, CompanionController.updateProfile);
router.post('/companions/availability', authenticate, CompanionController.setAvailability);

// ==========================================
// 4. BOOKINGS
// ==========================================
router.post('/bookings', authenticate, bookingLimiter, validate(bookingCreateSchema), BookingController.create);
router.get('/bookings', authenticate, BookingController.list);
router.get('/bookings/:id', authenticate, BookingController.getById);

// Status actions
router.post('/bookings/:id/accept', authenticate, BookingController.accept);
router.post('/bookings/:id/reject', authenticate, BookingController.reject);
router.post('/bookings/:id/cancel', authenticate, validate(bookingStatusUpdateSchema), BookingController.cancel);
router.post('/bookings/:id/complete', authenticate, BookingController.complete);

// ==========================================
// 5. PAYMENTS & REFUNDS
// ==========================================
router.post('/payments/create-order', authenticate, PaymentController.createOrder);
router.post('/payments/verify', authenticate, validate(paymentVerifySchema), PaymentController.verify);
router.post('/payments/webhook', PaymentController.webhook); // Gateway verified
router.get('/payments/:id', authenticate, PaymentController.getById);
router.get('/earnings', authenticate, CompanionController.getEarnings);
router.post('/payouts', authenticate, CompanionController.requestPayout);

// ==========================================
// 6. KYC VERIFICATION
// ==========================================
router.post('/kyc', authenticate, uploadLimiter, kycUploadFields, validate(kycSubmitSchema), KYCController.submitKYC);
router.get('/kyc/status', authenticate, KYCController.getStatus);
router.get('/kyc/documents', authenticate, KYCController.getDocuments);

// ==========================================
// 7. SAFETY CENTER & BLOCKS
// ==========================================
router.post('/reports', authenticate, validate(reportSubmitSchema), SafetyController.submitReport);

// Blocking engine
router.post('/users/:id/block', authenticate, validate(blockUserSchema), SafetyController.blockUser);
router.delete('/users/:id/block', authenticate, validate(blockUserSchema), SafetyController.unblockUser);
router.get('/users/blocked', authenticate, SafetyController.getBlockedUsers);

// SOS emergency endpoints
router.get('/safety/emergency-contacts', authenticate, SafetyController.getEmergencyContacts);
router.post('/safety/emergency', authenticate, validate(emergencyTriggerSchema), SafetyController.triggerEmergency);

// ==========================================
// 8. NOTIFICATIONS
// ==========================================
router.get('/notifications', authenticate, NotificationController.getNotifications);
router.put('/notifications/:id/read', authenticate, NotificationController.markAsRead);
router.put('/notifications/read-all', authenticate, NotificationController.markAllAsRead);

// ==========================================
// 9. ADMIN & MODERATION DASHBOARDS
// ==========================================
const adminRoles = authorize(['ADMIN', 'SUPER_ADMIN']);
const moderatorRoles = authorize(['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT']);
const financeRoles = authorize(['ADMIN', 'SUPER_ADMIN', 'FINANCE']);

router.get('/admin/analytics', authenticate, moderatorRoles, AdminController.getAnalytics);

// KYC approval tasks
router.get('/admin/kyc', authenticate, moderatorRoles, AdminController.getPendingKYCs);
router.post('/admin/kyc/:id/review', authenticate, adminRoles, validate(kycReviewSchema), AdminController.reviewKYC);

// Moderation tickets
router.get('/admin/reports', authenticate, moderatorRoles, AdminController.getReports);
router.post('/admin/reports/:id/resolve', authenticate, adminRoles, AdminController.resolveReport);

// Financial payouts
router.get('/admin/payouts', authenticate, financeRoles, AdminController.getPayouts);
router.post('/admin/payouts/:id/approve', authenticate, financeRoles, AdminController.approvePayout);

// Auditing logs
router.get('/admin/audit-logs', authenticate, adminRoles, AdminController.getAuditLogs);

// Metadata adjustments
router.post('/admin/cities', authenticate, adminRoles, validate(cityAdminSchema), MetadataController.createCity);
router.put('/admin/cities/:id', authenticate, adminRoles, validate(cityAdminSchema), MetadataController.updateCity);
router.post('/admin/activities', authenticate, adminRoles, validate(activityAdminSchema), MetadataController.createActivity);
router.put('/admin/activities/:id', authenticate, adminRoles, validate(activityAdminSchema), MetadataController.updateActivity);

export default router;
