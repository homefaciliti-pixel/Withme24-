import { Request, Response } from 'express';
import { Op } from 'sequelize';
import {
  CompanionProfile,
  User,
  City,
  CompanionActivity,
  Activity,
  Availability,
  Review,
  Block,
  Booking,
  Wallet,
  Earning,
  Payout,
} from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export class CompanionController {
  /**
   * GET /api/companions
   * Public companion directory with filters, excluding blocked relationships.
   */
  public static async listCompanions(req: AuthenticatedRequest, res: Response) {
    const { city_id, activity_id, rating, date } = req.query;

    try {
      const blockedUserIds: number[] = [];

      // If user is authenticated, retrieve blocked lists to exclude
      if (req.user) {
        const blocks = await Block.findAll({
          where: {
            [Op.or]: [{ blocker_id: req.user.id }, { blocked_id: req.user.id }],
          },
        });
        blocks.forEach((b) => {
          if (b.blocker_id !== req.user!.id) blockedUserIds.push(b.blocker_id);
          if (b.blocked_id !== req.user!.id) blockedUserIds.push(b.blocked_id);
        });
      }

      // Base query conditions for public profiles
      const profileWhere: any = {
        profile_visibility: 'PUBLIC',
        is_available: true,
      };

      if (process.env.NODE_ENV === 'production') {
        profileWhere.verification_status = 'VERIFIED';
      } else {
        profileWhere.verification_status = { [Op.in]: ['VERIFIED', 'PENDING', 'UNDER_REVIEW'] };
      }

      if (blockedUserIds.length > 0) {
        profileWhere.user_id = { [Op.notIn]: blockedUserIds };
      }

      if (rating) {
        profileWhere.rating = { [Op.gte]: parseFloat(rating as string) };
      }

      // User table filters (City)
      const userWhere: any = {
        account_status: 'ACTIVE',
      };
      if (city_id) {
        userWhere.city_id = parseInt(city_id as string, 10);
      }

      // Companion Activity filter
      const activityInclude: any = {
        model: CompanionActivity,
        as: 'companion_activities',
        include: [{ model: Activity, as: 'activity' }],
      };
      if (activity_id) {
        activityInclude.where = { activity_id: parseInt(activity_id as string, 10) };
      }

      // Availability check
      const availabilityInclude: any = {
        model: Availability,
        as: 'availabilities',
        where: { is_booked: false },
        required: false,
      };
      if (date) {
        availabilityInclude.where.date = date as string;
        availabilityInclude.required = true; // force profile to have slot on this day
      }

      const companions = await CompanionProfile.findAll({
        where: profileWhere,
        include: [
          {
            model: User,
            as: 'user',
            where: userWhere,
            attributes: ['id', 'name', 'profile_photo', 'is_demo'],
            include: [{ model: City, as: 'city', attributes: ['id', 'name'] }],
          },
          activityInclude,
          availabilityInclude,
        ],
        order: [['rating', 'DESC']],
      });

      // Filter out any companions whose users were excluded by join (Sequelize does this naturally, but good to ensure user exists)
      const sanitized = companions.filter((c) => c.user !== null);

      return res.status(200).json({ success: true, data: sanitized });
    } catch (error) {
      console.error('List Companions Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/companions/:id
   * Public profile detail - hides sensitive addresses, phones, and emails.
   */
  public static async getCompanionDetail(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id, 10);

    try {
      const companion = await CompanionProfile.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            where: { account_status: 'ACTIVE' },
            attributes: ['id', 'name', 'profile_photo', 'gender', 'is_demo'],
            include: [{ model: City, as: 'city', attributes: ['id', 'name'] }],
          },
          {
            model: CompanionActivity,
            as: 'companion_activities',
            include: [{ model: Activity, as: 'activity', attributes: ['id', 'name', 'description'] }],
          },
        ],
      });

      if (!companion || companion.profile_visibility === 'PRIVATE') {
        return res.status(404).json({ success: false, message: 'Companion profile not found' });
      }

      // Check block status
      if (req.user) {
        const isBlocked = await Block.findOne({
          where: {
            [Op.or]: [
              { blocker_id: req.user.id, blocked_id: companion.user_id },
              { blocker_id: companion.user_id, blocked_id: req.user.id },
            ],
          },
        });
        if (isBlocked) {
          return res.status(404).json({ success: false, message: 'Companion profile is unavailable' });
        }
      }

      return res.status(200).json({ success: true, data: companion });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/companions/:id/availability
   */
  public static async getAvailability(req: Request, res: Response) {
    const companionId = parseInt(req.params.id, 10);
    const { date } = req.query;

    try {
      const whereCond: any = {
        companion_id: companionId,
        is_booked: false,
        date: { [Op.gte]: new Date().toISOString().split('T')[0] }, // current or future
      };

      if (date) {
        whereCond.date = date as string;
      }

      const slots = await Availability.findAll({
        where: whereCond,
        order: [
          ['date', 'ASC'],
          ['start_time', 'ASC'],
        ],
      });

      return res.status(200).json({ success: true, data: slots });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/companions/availability
   * Managed by companions to set their calendars.
   */
  public static async setAvailability(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const { date, start_time, end_time } = req.body;

    if (user.role !== 'COMPANION' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only companions can configure availability slots' });
    }

    try {
      const profile = await CompanionProfile.findOne({ where: { user_id: user.id } });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Companion profile not created' });
      }

      // Check slot duplication
      const existing = await Availability.findOne({
        where: {
          companion_id: profile.id,
          date,
          start_time,
          end_time,
        },
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Availability slot already exists' });
      }

      const slot = await Availability.create({
        companion_id: profile.id,
        date,
        start_time,
        end_time,
        is_booked: false,
      });

      return res.status(201).json({ success: true, message: 'Slot created successfully', data: slot });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/companions/profile
   * Create or update biography, experience, active activities and pricing.
   */
  public static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const { bio, experience, activities, profile_visibility } = req.body; 
    // activities format: [{ activity_id: 1, price_per_hour: 400 }]

    try {
      let profile = await CompanionProfile.findOne({ where: { user_id: user.id } });

      if (!profile) {
        // Automatically link wallet upon companion profile creation
        profile = await CompanionProfile.create({
          user_id: user.id,
          bio,
          experience,
          verification_status: 'NOT_STARTED',
          profile_visibility: 'PRIVATE',
        });
      } else {
        await profile.update({
          bio,
          experience,
          profile_visibility: profile_visibility || profile.profile_visibility,
        });
      }

      // Synchronize activities list
      if (Array.isArray(activities)) {
        // Delete all old selections
        await CompanionActivity.destroy({ where: { companion_id: profile.id } });

        // Seed new entries
        const records = activities.map((act: any) => ({
          companion_id: profile.id,
          activity_id: act.activity_id,
          price_per_hour: act.price_per_hour,
        }));
        await CompanionActivity.bulkCreate(records);
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error) {
      console.error('Update companion profile error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/companions/:id/reviews
   */
  public static async getReviews(req: Request, res: Response) {
    const companionId = parseInt(req.params.id, 10);

    try {
      const reviews = await Review.findAll({
        where: { companion_id: companionId },
        include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'profile_photo'] }],
        order: [['created_at', 'DESC']],
      });

      return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/reviews
   * Submits a review for a COMPLETED booking.
   */
  public static async submitReview(req: AuthenticatedRequest, res: Response) {
    const customer = req.user!;
    const { booking_id, rating, comment } = req.body;

    try {
      const booking = await Booking.findOne({
        where: { id: booking_id, customer_id: customer.id },
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking request not found' });
      }

      if (booking.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Reviews can only be submitted for completed companion outings',
        });
      }

      const existing = await Review.findOne({ where: { booking_id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this outing session' });
      }

      const review = await Review.create({
        booking_id,
        customer_id: customer.id,
        companion_id: booking.companion_id,
        rating,
        comment,
      });

      // Update CompanionProfile overall average rating
      const profile = await CompanionProfile.findByPk(booking.companion_id);
      if (profile) {
        const currentRating = parseFloat(profile.rating.toString());
        const totalReviews = profile.total_reviews;
        const newRating = (currentRating * totalReviews + rating) / (totalReviews + 1);

        await profile.update({
          rating: newRating,
          total_reviews: totalReviews + 1,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Review registered successfully',
        data: review,
      });
    } catch (error) {
      console.error('Submit Review Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/earnings
   */
  public static async getEarnings(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    try {
      const profile = await CompanionProfile.findOne({ where: { user_id: user.id } });
      if (!profile) return res.status(404).json({ success: false, message: 'Companion profile not found' });

      let wallet = await Wallet.findOne({ where: { companion_id: profile.id } });
      if (!wallet) {
        wallet = await Wallet.create({ companion_id: profile.id });
      }

      const earnings = await Earning.findAll({
        where: { wallet_id: wallet.id },
        order: [['created_at', 'DESC']],
        limit: 50,
      });

      const payouts = await Payout.findAll({
        where: { wallet_id: wallet.id },
        order: [['created_at', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: {
          wallet,
          earnings,
          payouts,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/payouts
   */
  public static async requestPayout(req: AuthenticatedRequest, res: Response) {
    const user = req.user!;
    const { amount } = req.body;

    try {
      const profile = await CompanionProfile.findOne({ where: { user_id: user.id } });
      if (!profile) return res.status(404).json({ success: false, message: 'Companion profile not found' });

      const wallet = await Wallet.findOne({ where: { companion_id: profile.id } });
      if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

      const available = parseFloat(wallet.available_balance.toString());
      const reqAmount = parseFloat(amount);

      if (reqAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid payout amount requested' });
      }

      if (available < reqAmount) {
        return res.status(400).json({ success: false, message: 'Insufficient available balance' });
      }

      // Create payout in PENDING
      const payout = await Payout.create({
        wallet_id: wallet.id,
        amount: reqAmount,
        status: 'PENDING',
        requested_at: new Date(),
      });

      return res.status(201).json({
        success: true,
        message: 'Payout requested successfully. Pending finance team approval.',
        data: payout,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
