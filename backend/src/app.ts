import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import { config } from './config/env';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimit.middleware';

// Route imports
import addonRouter from './modules/addons/addon.routes';
import authRouter from './modules/auth/auth.routes';
import bannerRouter from './modules/banners/banner.routes';
import bookingRouter from './modules/bookings/booking.routes';
import cakeRouter from './modules/cakes/cake.routes';
import cityRouter from './modules/cities/city.routes';
import couponRouter from './modules/coupons/coupon.routes';
import customerRouter from './modules/customers/customer.routes';
import giftRouter from './modules/gifts/gift.routes';
import locationRouter from './modules/locations/location.routes';
import occasionRouter from './modules/occasions/occasion.routes';
import paymentRouter from './modules/payments/payment.routes';
import screenRouter from './modules/screens/screen.routes';

export function createApp(): Application {
  const app = express();

  // ─── Trust proxy (for rate limiting behind nginx/load balancer) ─────────────
  app.set('trust proxy', 1);

  // ─── Security headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow static file serving
    }),
  );

  // ─── CORS ────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: [config.urls.frontend, 'http://localhost:1234'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    }),
  );

  // ─── Rate limiting ───────────────────────────────────────────────────────────
  app.use(generalRateLimiter);

  // ─── Webhook route — must be BEFORE express.json() ───────────────────────────
  // The webhook route uses express.raw() internally (defined in payment.routes.ts)
  app.use('/api/payments', paymentRouter);

  // ─── Body parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ─── Static file serving ─────────────────────────────────────────────────────
  app.use('/uploads', express.static('public/uploads'));

  // ─── Health check ─────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] ?? 'unknown',
        environment: config.nodeEnv,
      },
    });
  });

  // ─── Modular TypeScript API Routes ───────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/bookings', bookingRouter);
  app.use('/api/cities', cityRouter);
  app.use('/api/locations', locationRouter);
  app.use('/api/coupons', couponRouter);
  app.use('/api/banners', bannerRouter);
  app.use('/api/gifts', giftRouter);
  app.use('/api/addons', addonRouter);
  app.use('/api/screens', screenRouter);
  app.use('/api/occasions', occasionRouter);
  app.use('/api/cakes', cakeRouter);
  app.use('/api/customers', customerRouter);

  // ─── 404 + Global error handler (must be last) ────────────────────────────────
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
