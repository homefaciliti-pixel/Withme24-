import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    mobile: z
      .string()
      .min(10, 'Mobile number must be at least 10 characters')
      .max(15, 'Mobile number cannot exceed 15 characters')
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile phone number format'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    mobile: z.string(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
    role: z.enum(['CUSTOMER', 'COMPANION']).optional(),
    device: z.string().optional(),
    user_agent: z.string().optional(),
  }),
});

export const kycSubmitSchema = z.object({
  body: z.object({
    document_type: z.enum(['Aadhaar', 'Passport', 'Driving License', 'PAN Card']),
  }),
});

export const kycReviewSchema = z.object({
  body: z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    rejection_reason: z.string().optional(),
  }),
});

export const bookingCreateSchema = z.object({
  body: z.object({
    companion_id: z.number().int().positive(),
    activity_id: z.number().int().positive(),
    availability_id: z.number().int().positive(),
  }),
});

export const paymentVerifySchema = z.object({
  body: z.object({
    order_id: z.string(),
    payment_id: z.string(),
    signature: z.string(),
  }),
});

export const bookingStatusUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED']),
    cancellation_reason: z.string().optional(),
  }),
});

export const reviewSubmitSchema = z.object({
  body: z.object({
    booking_id: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const reviewReplySchema = z.object({
  body: z.object({
    reply: z.string().min(1, 'Reply content cannot be empty'),
  }),
});

export const reportSubmitSchema = z.object({
  body: z.object({
    reported_user_id: z.number().int().positive(),
    booking_id: z.number().int().positive().optional(),
    reason: z.enum([
      'HARASSMENT',
      'UNSAFE_BEHAVIOUR',
      'FRAUD',
      'FAKE_PROFILE',
      'PROHIBITED_SERVICE',
      'THREAT',
      'ABUSE',
      'SCAM',
      'OTHER',
    ]),
    description: z.string().min(10, 'Please provide a description of at least 10 characters'),
  }),
});

export const blockUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer').transform(Number),
  }),
});

export const emergencyTriggerSchema = z.object({
  body: z.object({
    booking_id: z.number().int().positive(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const activityAdminSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Activity name must be at least 3 characters'),
    description: z.string().optional(),
    image_url: z.string().url().optional().or(z.literal('')),
    is_active: z.boolean().optional(),
  }),
});

export const cityAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'City name must be at least 2 characters'),
    is_active: z.boolean().optional(),
  }),
});
