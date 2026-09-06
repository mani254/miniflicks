import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Auth
  JWT_SECRET: z
    .string()
    .min(20, 'JWT_SECRET must be at least 20 characters for security'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),

  // Frontend & backend URIs (used for CORS and image URLs)
  FRONTENDURI: z.string().url('FRONTENDURI must be a valid URL'),
  BACKENDURI: z.string().url('BACKENDURI must be a valid URL'),

  // Redis — required (no optional fallback per project decision)
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Mail — Sendinblue / Brevo / SMTP
  SMTP_HOST: z.string().default('smtp-relay.brevo.com'),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('"MiniFlicks" <miniflicksprivatetheatres@gmail.com>'),
});

function parseEnv() {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  - ${e.path.map(String).join('.')}: ${e.message}`)
      .join('\n');
    console.error(`\n[CONFIG] Environment validation failed:\n${errors}\n`);
    process.exit(1);
  }

  return result.data;
}

const _env = parseEnv();

/**
 * Strongly-typed, validated application configuration.
 * Access this instead of process.env throughout the codebase.
 */
export const config = {
  nodeEnv: _env.NODE_ENV,
  port: _env.PORT,
  isProduction: _env.NODE_ENV === 'production',
  isDevelopment: _env.NODE_ENV === 'development',

  mongodb: {
    uri: _env.MONGODB_URI,
  },

  auth: {
    jwtSecret: _env.JWT_SECRET,
    jwtExpiresIn: '3d' as const,
    cookieName: 'authToken' as const,
  },

  razorpay: {
    keyId: _env.RAZORPAY_KEY_ID,
    keySecret: _env.RAZORPAY_KEY_SECRET,
  },

  urls: {
    frontend: _env.FRONTENDURI,
    backend: _env.BACKENDURI,
  },

  redis: {
    url: _env.REDIS_URL,
    ttl: {
      pendingBookingSession: 15 * 60,     // 15 minutes (matches booking window)
      slotAvailabilityCache: 30,          // 30 seconds
      rateLimitWindow: 15 * 60,           // 15 minutes
    },
    keyPrefix: 'miniflicks:',
  },

  mail: {
    host: _env.SMTP_HOST,
    port: _env.SMTP_PORT,
    user: _env.SMTP_USER,
    pass: _env.SMTP_PASS,
    from: _env.SMTP_FROM,
  },

  upload: {
    maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  },

  booking: {
    pendingCancellationMinutes: 10,     // Cancel pending booking after 10 min
    minAdvancePaymentRupees: 999,       // Minimum Razorpay partial payment
    ledExtraChargePerChar: 30,          // Rs 30 per extra character beyond 8 in LED name
    ledFreeCharacters: 8,               // First 8 characters are free
  },
} as const;

export type Config = typeof config;
