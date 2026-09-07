import rateLimit from 'express-rate-limit';

/**
 * Auth login rate limiter — 5 attempts per 15 minutes per IP.
 * Prevents brute-force password attacks (fixes H1).
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

/**
 * Customer booking rate limiter — 10 requests per minute per IP.
 * Prevents booking spam.
 */
export const bookingRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many booking requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

/**
 * General API rate limiter — 200 requests per minute per IP.
 * Applied globally to all routes.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) => {
    // Never rate limit webhook endpoint
    return req.path === '/api/payments/webhook';
  },
});
