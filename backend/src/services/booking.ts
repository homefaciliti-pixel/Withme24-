import { sequelize, User, CompanionProfile, CompanionActivity, Availability, Booking, Commission } from '../models';

export interface CreateBookingParams {
  customerId: number;
  companionId: number;
  activityId: number;
  availabilityId: number;
}

export class BookingService {
  /**
   * Safe booking creation with SELECT FOR UPDATE locks to prevent double booking.
   */
  public static async createBooking(params: CreateBookingParams): Promise<Booking> {
    const { customerId, companionId, activityId, availabilityId } = params;

    return await sequelize.transaction(async (t) => {
      // 1. Verify customer status & 18+ verification
      const customer = await User.findByPk(customerId, { transaction: t });
      if (!customer) {
        throw new Error('CUSTOMER_NOT_FOUND');
      }
      if (!customer.is_18_plus_verified) {
        throw new Error('CUSTOMER_NOT_18_PLUS');
      }
      if (customer.account_status !== 'ACTIVE') {
        throw new Error('CUSTOMER_NOT_ACTIVE');
      }

      // 2. Verify companion existence and verification status
      const companion = await CompanionProfile.findByPk(companionId, {
        include: [{ model: User, as: 'user' }],
        transaction: t,
      });
      if (!companion || !companion.user) {
        throw new Error('COMPANION_NOT_FOUND');
      }
      if (companion.verification_status !== 'VERIFIED') {
        throw new Error('COMPANION_NOT_VERIFIED');
      }
      if (companion.user.account_status !== 'ACTIVE') {
        throw new Error('COMPANION_NOT_ACTIVE');
      }

      // 3. Verify activity and retrieve official server-side pricing
      const companionActivity = await CompanionActivity.findOne({
        where: { companion_id: companionId, activity_id: activityId },
        transaction: t,
      });
      if (!companionActivity) {
        throw new Error('ACTIVITY_NOT_OFFERED_BY_COMPANION');
      }

      // 4. LOCK the slot using SELECT FOR UPDATE to prevent race conditions
      const slot = await Availability.findOne({
        where: { id: availabilityId, companion_id: companionId, is_booked: false },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!slot) {
        throw new Error('SLOT_NOT_AVAILABLE');
      }

      // 5. Double Booking Check - Check for conflicting bookings in active states
      const conflictingBooking = await Booking.findOne({
        where: {
          availability_id: availabilityId,
          status: ['PENDING', 'ACCEPTED', 'PAYMENT_PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
        transaction: t,
      });

      if (conflictingBooking) {
        throw new Error('BOOKING_SLOT_UNAVAILABLE');
      }

      // 6. Calculate Duration and Prices
      const hourlyRate = parseFloat(companionActivity.price_per_hour.toString());
      
      const [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);
      let durationHours = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
      
      if (durationHours <= 0) {
        durationHours = 1; // Fallback to 1 hour minimum
      }

      // Financial Calculation
      const basePrice = hourlyRate * durationHours;
      const commissionPercentage = 25.00; // standard commission rate
      const platformFee = basePrice * (commissionPercentage / 100);
      const taxRate = 18.00; // 18% tax
      const tax = platformFee * (taxRate / 100);
      const totalAmount = basePrice + tax;
      const companionAmount = basePrice - platformFee;

      // 7. Generate random, unique booking number
      const bookingNumber = `WM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 8. Create Booking
      const booking = await Booking.create(
        {
          booking_number: bookingNumber,
          customer_id: customerId,
          companion_id: companionId,
          activity_id: activityId,
          availability_id: availabilityId,
          booking_date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          duration: durationHours,
          base_price: basePrice,
          platform_fee: platformFee,
          tax,
          discount: 0.00,
          total_amount: totalAmount,
          status: 'PENDING',
          payment_status: 'PENDING',
        },
        { transaction: t }
      );

      // 9. Save Commission Record
      await Commission.create(
        {
          booking_id: booking.id,
          percentage: commissionPercentage,
          gross_amount: basePrice,
          platform_amount: platformFee,
          companion_amount: companionAmount,
        },
        { transaction: t }
      );

      return booking;
    });
  }
}
