import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute.',
    error: { code: 'API_RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // Relaxed limit to prevent 429 blocking during active testing
  message: {
    success: false,
    message: 'OTP request limit exceeded, please wait a few minutes before trying again.',
    error: { code: 'OTP_RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 verification requests
  message: {
    success: false,
    message: 'Login attempt limit exceeded. Try again in 15 minutes.',
    error: { code: 'LOGIN_RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  message: {
    success: false,
    message: 'Booking request rate limit reached. Please try again after an hour.',
    error: { code: 'BOOKING_RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  message: {
    success: false,
    message: 'File upload rate limit reached. Please try again after an hour.',
    error: { code: 'UPLOAD_RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
