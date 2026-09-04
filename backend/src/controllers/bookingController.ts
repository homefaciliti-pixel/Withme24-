import { Response } from 'express';
import { Booking, CompanionProfile, User, Activity, Availability, Payment, Commission, Wallet, Earning } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { BookingService } from '../services/booking';
import { NotificationService } from '../services/notification';
import { sequelize } from '../models';

export class BookingController {
  /**
   * POST /api/bookings
   * Request a companion booking. Server verifies pricing and locks slot.
   */
  public static async create(req: AuthenticatedRequest, res: Response) {
    const customer = req.user!;
    const { companion_id, activity_id, availability_id } = req.body;

    try {
      const booking = await BookingService.createBooking({
        customerId: customer.id,
        companionId: companion_id,
        activityId: activity_id,
        availabilityId: availability_id,
      });

      // Update availability to flagged as booked
      await Availability.update(
        { is_booked: true },
        { where: { id: availability_id } }
      );

      // Notify Companion (In-App)
      const companion = await CompanionProfile.findByPk(companion_id, {
        include: [{ model: User, as: 'user' }],
      });
      const activity = await Activity.findByPk(activity_id);

      if (companion && companion.user && activity) {
        await NotificationService.sendNotification({
          userId: companion.user.id,
          templateKey: 'booking_created',
          variables: {
            companion_name: companion.user.name || 'Companion',
            activity_name: activity.name,
            booking_date: booking.booking_date,
            start_time: booking.start_time,
          },
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Booking request submitted successfully',
        data: booking,
      });
    } catch (error: any) {
      console.error('Booking Creation Error:', error);
      
      const statusMap: Record<string, number> = {
        CUSTOMER_NOT_FOUND: 404,
        CUSTOMER_NOT_18_PLUS: 403,
        CUSTOMER_NOT_ACTIVE: 403,
        COMPANION_NOT_FOUND: 404,
        COMPANION_NOT_VERIFIED: 403,
        COMPANION_NOT_ACTIVE: 403,
        ACTIVITY_NOT_OFFERED_BY_COMPANION: 400,
        SLOT_NOT_AVAILABLE: 400,
        BOOKING_SLOT_UNAVAILABLE: 409,
      };

      const status = statusMap[error.message] || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error',
        error: { code: error.message || 'BOOKING_FAILED' },
      });
    }
  }

  /**
   * GET /api/bookings
   * List bookings associated with customer, companion, or all (Admin).
   */
  public static async list(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;

    try {
      let bookings;

      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'SUPPORT') {
        bookings = await Booking.findAll({
          include: [
            { model: User, as: 'customer', attributes: ['id', 'name', 'profile_photo'] },
            { model: CompanionProfile, as: 'companion', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] },
            { model: Activity, as: 'activity', attributes: ['id', 'name'] },
          ],
          order: [['created_at', 'DESC']],
        });
      } else if (user.role === 'COMPANION') {
        const companion = await CompanionProfile.findOne({ where: { user_id: user.id } });
        if (!companion) {
          return res.status(200).json({ success: true, data: [] });
        }

        bookings = await Booking.findAll({
          where: { companion_id: companion.id },
          include: [
            { model: User, as: 'customer', attributes: ['id', 'name', 'profile_photo'] },
            { model: Activity, as: 'activity', attributes: ['id', 'name'] },
          ],
          order: [['created_at', 'DESC']],
        });
      } else {
        // Customer role
        bookings = await Booking.findAll({
          where: { customer_id: user.id },
          include: [
            { model: CompanionProfile, as: 'companion', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profile_photo'] }] },
            { model: Activity, as: 'activity', attributes: ['id', 'name'] },
          ],
          order: [['created_at', 'DESC']],
        });
      }

      return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/bookings/:id
   * Read single booking. Enforces ownership safety logic.
   */
  public static async getById(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);

    try {
      const booking = await Booking.findByPk(id, {
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name', 'mobile', 'email', 'profile_photo'] },
          { model: CompanionProfile, as: 'companion', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profile_photo'] }] },
          { model: Activity, as: 'activity' },
          { model: Availability, as: 'availability' },
          { model: Payment, as: 'payment' },
        ],
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Authorization checks
      const isCustomerOwner = booking.customer_id === user.id;
      const isCompanionOwner = booking.companion?.user_id === user.id;
      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT', 'FINANCE'].includes(user.role);

      if (!isCustomerOwner && !isCompanionOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this booking record',
          error: { code: 'UNAUTHORIZED_ACCESS' },
        });
      }

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/bookings/:id/accept
   */
  public static async accept(req: AuthenticatedRequest, res: Response) {
    const companionUser = req.user!;
    const id = parseInt(req.params.id, 10);

    try {
      const companion = await CompanionProfile.findOne({ where: { user_id: companionUser.id } });
      if (!companion) return res.status(404).json({ success: false, message: 'Companion profile not found' });

      const booking = await Booking.findOne({ where: { id, companion_id: companion.id } });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking request not found' });

      if (booking.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Only PENDING booking requests can be accepted' });
      }

      await booking.update({ status: 'PAYMENT_PENDING' });

      // Notify Customer (In-App)
      await NotificationService.sendNotification({
        userId: booking.customer_id,
        templateKey: 'booking_confirmed',
        variables: {
          customer_name: 'Customer',
          booking_number: booking.booking_number,
          companion_name: companionUser.name || 'Companion',
        },
      });

      return res.status(200).json({ success: true, message: 'Booking accepted, pending customer payment', data: booking });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/bookings/:id/reject
   */
  public static async reject(req: AuthenticatedRequest, res: Response) {
    const companionUser = req.user!;
    const id = parseInt(req.params.id, 10);

    try {
      const companion = await CompanionProfile.findOne({ where: { user_id: companionUser.id } });
      if (!companion) return res.status(404).json({ success: false, message: 'Companion profile not found' });

      const booking = await Booking.findOne({ where: { id, companion_id: companion.id } });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking request not found' });

      if (booking.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Only PENDING booking requests can be rejected' });
      }

      await booking.update({ status: 'REJECTED' });

      // Release availability slot
      await Availability.update(
        { is_booked: false },
        { where: { id: booking.availability_id } }
      );

      return res.status(200).json({ success: true, message: 'Booking request rejected successfully', data: booking });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/bookings/:id/cancel
   */
  public static async cancel(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    const { cancellation_reason } = req.body;

    try {
      const booking = await Booking.findByPk(id, {
        include: [{ model: CompanionProfile, as: 'companion' }],
      });

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      const isCustomerOwner = booking.customer_id === user.id;
      const isCompanionOwner = booking.companion?.user_id === user.id;

      if (!isCustomerOwner && !isCompanionOwner) {
        return res.status(403).json({ success: false, message: 'Unauthorized cancellation request' });
      }

      if (['COMPLETED', 'CANCELLED', 'REFUNDED', 'EXPIRED'].includes(booking.status)) {
        return res.status(400).json({ success: false, message: 'Booking cannot be cancelled in its current state' });
      }

      await booking.update({
        status: 'CANCELLED',
        cancellation_reason: cancellation_reason || 'Cancelled by user',
      });

      // Release availability slot
      await Availability.update(
        { is_booked: false },
        { where: { id: booking.availability_id } }
      );

      // Refund assessment: If payment was already successful, flag refund status
      if (booking.payment_status === 'PAID') {
        await booking.update({ payment_status: 'REFUNDED' });
        // In production: trigger payment service refund api
      }

      return res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/bookings/:id/complete
   * Complete booking session, distribute platform cut, credit companion balance.
   */
  public static async complete(req: AuthenticatedRequest, res: Response) {
    const companionUser = req.user!;
    const id = parseInt(req.params.id, 10);

    try {
      const companion = await CompanionProfile.findOne({ where: { user_id: companionUser.id } });
      if (!companion) return res.status(404).json({ success: false, message: 'Companion profile not found' });

      const booking = await Booking.findOne({
        where: { id, companion_id: companion.id },
        include: [{ model: Commission, as: 'commission' }],
      });

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
        return res.status(400).json({ success: false, message: 'Only CONFIRMED bookings can be completed' });
      }

      await sequelize.transaction(async (t) => {
        // Update booking state
        await booking.update({ status: 'COMPLETED' }, { transaction: t });

        // Retrieve Wallet or create if missing
        let wallet = await Wallet.findOne({ where: { companion_id: companion.id }, transaction: t });
        if (!wallet) {
          wallet = await Wallet.create({ companion_id: companion.id }, { transaction: t });
        }

        // Get companion amount from commission record
        const earningsAmount = booking.commission
          ? parseFloat(booking.commission.companion_amount.toString())
          : parseFloat(booking.base_price.toString()) * 0.75; // default 75% fallback

        // Update balance pools
        await wallet.update(
          {
            total_earnings: parseFloat(wallet.total_earnings.toString()) + earningsAmount,
            available_balance: parseFloat(wallet.available_balance.toString()) + earningsAmount,
          },
          { transaction: t }
        );

        // Save companion earnings ledger entry
        await Earning.create(
          {
            wallet_id: wallet.id,
            booking_id: booking.id,
            amount: earningsAmount,
            status: 'SETTLED',
            type: 'CREDIT',
            description: `Settlement for booking #${booking.booking_number}`,
          },
          { transaction: t }
        );
      });

      return res.status(200).json({ success: true, message: 'Booking session completed and companion wallet credited', data: booking });
    } catch (error) {
      console.error('Booking Complete Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
