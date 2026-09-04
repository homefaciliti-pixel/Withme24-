import { Request, Response } from 'express';
import { Booking, Payment, Transaction, Refund, CompanionProfile, User } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { getPaymentService } from '../services/payment';
import { NotificationService } from '../services/notification';
import { sequelize } from '../models';
import crypto from 'crypto';

export class PaymentController {
  /**
   * POST /api/payments/create-order
   * Generate gateway order id.
   */
  public static async createOrder(req: AuthenticatedRequest, res: Response) {
    const { booking_id } = req.body;
    const customer = req.user!;

    try {
      const booking = await Booking.findOne({
        where: { id: booking_id, customer_id: customer.id },
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking request not found' });
      }

      if (booking.status !== 'PAYMENT_PENDING' && booking.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Booking has invalid status for payment: ${booking.status}`,
        });
      }

      const paymentService = getPaymentService();
      const order = await paymentService.createOrder({
        bookingId: booking.id,
        amount: parseFloat(booking.total_amount.toString()),
        currency: 'INR',
      });

      // Record payment attempt
      await Payment.create({
        booking_id: booking.id,
        customer_id: customer.id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        payment_provider: order.provider,
        payment_status: 'CREATED',
      });

      // If booking was PENDING, update to PAYMENT_PENDING
      if (booking.status === 'PENDING') {
        await booking.update({ status: 'PAYMENT_PENDING' });
      }

      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      console.error('Create Order Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/payments/verify
   * Verify cryptographic payment signature. Enforces backend source-of-truth verification.
   */
  public static async verify(req: AuthenticatedRequest, res: Response) {
    const { order_id, payment_id, signature } = req.body;
    const customer = req.user!;

    try {
      const payment = await Payment.findOne({
        where: { order_id, customer_id: customer.id },
      });

      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment reference not found' });
      }

      if (payment.payment_status === 'SUCCESS') {
        return res.status(200).json({ success: true, message: 'Payment already verified successfully' });
      }

      const paymentService = getPaymentService();
      const verified = paymentService.verifySignature(order_id, payment_id, signature);

      if (!verified) {
        await payment.update({ payment_status: 'FAILED', signature_verified: false });
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: signature mismatch',
          error: { code: 'INVALID_SIGNATURE' },
        });
      }

      const booking = await Booking.findByPk(payment.booking_id, {
        include: [{ model: CompanionProfile, as: 'companion', include: [{ model: User, as: 'user' }] }],
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Associated booking not found' });
      }

      // Atomically verify payment state and update booking status
      await sequelize.transaction(async (t) => {
        await payment.update(
          {
            payment_status: 'SUCCESS',
            signature_verified: true,
            transaction_id: payment_id,
            paid_at: new Date(),
          },
          { transaction: t }
        );

        await booking.update(
          {
            status: 'CONFIRMED',
            payment_status: 'PAID',
          },
          { transaction: t }
        );

        // Log transaction ledger record
        await Transaction.create(
          {
            user_id: customer.id,
            booking_id: booking.id,
            payment_id: payment.id,
            transaction_type: 'PAYMENT',
            amount: parseFloat(payment.amount.toString()),
            currency: payment.currency,
            status: 'SUCCESS',
            reference: payment_id,
          },
          { transaction: t }
        );
      });

      // Send confirmation notifications in background
      if (booking.companion && booking.companion.user) {
        await NotificationService.sendNotification({
          userId: booking.companion.user.id,
          templateKey: 'booking_confirmed',
          variables: {
            customer_name: customer.name || 'Customer',
            booking_number: booking.booking_number,
            companion_name: booking.companion.user.name || 'Companion',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        data: { booking_id: booking.id, booking_number: booking.booking_number },
      });
    } catch (error) {
      console.error('Verify Payment Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/payments/webhook
   * Gateways webhook handler.
   */
  public static async webhook(req: Request, res: Response) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';
    const signatureHeader = req.headers['x-razorpay-signature'] as string;

    try {
      // Validate Webhook Signature
      if (signatureHeader) {
        const bodyStr = JSON.stringify(req.body);
        const expectedSig = crypto
          .createHmac('sha256', webhookSecret)
          .update(bodyStr)
          .digest('hex');

        if (expectedSig !== signatureHeader) {
          return res.status(400).json({ success: false, message: 'Webhook signature validation failed' });
        }
      }

      const event = req.body.event; // e.g. "payment.captured"
      
      // Idempotency and Webhook resolution logic
      if (event === 'payment.captured') {
        const payload = req.body.payload.payment.entity;
        const orderId = payload.order_id;
        const paymentId = payload.id;

        const payment = await Payment.findOne({ where: { order_id: orderId } });

        if (payment && payment.payment_status !== 'SUCCESS') {
          const booking = await Booking.findByPk(payment.booking_id);

          if (booking) {
            await sequelize.transaction(async (t) => {
              await payment.update(
                {
                  payment_status: 'SUCCESS',
                  signature_verified: true,
                  transaction_id: paymentId,
                  paid_at: new Date(),
                  gateway_response: JSON.stringify(payload),
                },
                { transaction: t }
              );

              await booking.update({ status: 'CONFIRMED', payment_status: 'PAID' }, { transaction: t });

              await Transaction.create(
                {
                  user_id: payment.customer_id,
                  booking_id: booking.id,
                  payment_id: payment.id,
                  transaction_type: 'PAYMENT',
                  amount: parseFloat(payment.amount.toString()),
                  currency: payment.currency,
                  status: 'SUCCESS',
                  reference: paymentId,
                },
                { transaction: t }
              );
            });
          }
        }
      }

      return res.status(200).json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({ success: false, message: 'Webhook ingestion error' });
    }
  }

  /**
   * POST /api/payments/:id/refund
   * Trigger refund for cancelled bookings. (Admin/Finance authorization required)
   */
  public static async refund(req: AuthenticatedRequest, res: Response) {
    const paymentId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    try {
      const payment = await Payment.findByPk(paymentId);
      if (!payment || payment.payment_status !== 'SUCCESS') {
        return res.status(404).json({ success: false, message: 'Successful payment not found' });
      }

      const booking = await Booking.findByPk(payment.booking_id);
      if (!booking || booking.status !== 'CANCELLED') {
        return res.status(400).json({ success: false, message: 'Associated booking must be CANCELLED before executing a refund' });
      }

      const paymentService = getPaymentService();
      const refundRef = await paymentService.refundPayment(
        payment.transaction_id || '',
        parseFloat(payment.amount.toString())
      );

      await sequelize.transaction(async (t) => {
        await payment.update({ payment_status: 'REFUNDED' }, { transaction: t });
        await booking.update({ payment_status: 'REFUNDED' }, { transaction: t });

        await Refund.create(
          {
            booking_id: booking.id,
            payment_id: payment.id,
            amount: parseFloat(payment.amount.toString()),
            reason: reason || 'Admin refund',
            refund_reference: refundRef,
            status: 'SUCCESS',
            processed_at: new Date(),
          },
          { transaction: t }
        );

        await Transaction.create(
          {
            user_id: payment.customer_id,
            booking_id: booking.id,
            payment_id: payment.id,
            transaction_type: 'REFUND',
            amount: -parseFloat(payment.amount.toString()),
            currency: payment.currency,
            status: 'SUCCESS',
            reference: refundRef,
          },
          { transaction: t }
        );
      });

      return res.status(200).json({ success: true, message: 'Refund initiated and logged successfully' });
    } catch (error) {
      console.error('Refund execution error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/payments/:id
   */
  public static async getById(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id, 10);
    const user = req.user!;

    try {
      const payment = await Payment.findByPk(id, {
        include: [{ model: Booking, as: 'booking' }],
      });

      if (!payment) return res.status(404).json({ success: false, message: 'Payment records not found' });

      // Security check
      if (payment.customer_id !== user.id && !['ADMIN', 'SUPER_ADMIN', 'FINANCE'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      return res.status(200).json({ success: true, data: payment });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
