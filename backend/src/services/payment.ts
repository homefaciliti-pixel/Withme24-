import crypto from 'crypto';

export interface CreateOrderParams {
  bookingId: number;
  amount: number; // in Rupees
  currency: string;
}

export interface OrderResult {
  id: string;
  amount: number;
  currency: string;
  provider: string;
}

export interface PaymentService {
  createOrder(params: CreateOrderParams): Promise<OrderResult>;
  verifySignature(orderId: string, paymentId: string, signature: string): boolean;
  refundPayment(paymentId: string, amount: number): Promise<string>;
}

export class MockPaymentService implements PaymentService {
  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    return {
      id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount: params.amount,
      currency: params.currency,
      provider: 'mock',
    };
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    // Accept standard or debug signatures for mock provider
    if (signature === 'debug_verified_signature') return true;
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mockSecret123';
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return signature === expected || signature === 'mock_signature';
  }

  async refundPayment(_paymentId: string, _amount: number): Promise<string> {
    return `refund_mock_${crypto.randomBytes(8).toString('hex')}`;
  }
}

export class RazorpayPaymentService implements PaymentService {
  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    // In production, you would import razorpay SDK:
    // const Razorpay = require('razorpay');
    // const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await rzp.orders.create({ amount: Math.round(params.amount * 100), currency: params.currency });
    // return { id: order.id, ... };
    
    return {
      id: `order_rzp_${crypto.randomBytes(8).toString('hex')}`,
      amount: params.amount,
      currency: params.currency,
      provider: 'razorpay',
    };
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return generatedSignature === signature;
  }

  async refundPayment(_paymentId: string, _amount: number): Promise<string> {
    // In production: refund order via Razorpay client API
    return `refund_rzp_${crypto.randomBytes(8).toString('hex')}`;
  }
}

export const getPaymentService = (): PaymentService => {
  if (process.env.PAYMENT_MODE === 'razorpay') {
    return new RazorpayPaymentService();
  }
  return new MockPaymentService();
};
