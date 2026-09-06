import { Router } from 'express';
import express from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { verifyPayment, cancelPayment, razorpayWebhook, deletePendingOrder } from './payment.controller';

const paymentRouter = Router();

/**
 * Webhook route — must use raw body parser for signature verification.
 * Registered before express.json() in app.ts.
 */
paymentRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  razorpayWebhook,
);

/** Customer-facing routes */
paymentRouter.post('/verify', verifyPayment);
paymentRouter.post('/cancel', cancelPayment);

/** Admin routes */
paymentRouter.delete('/pending/:orderId', requireAuth, deletePendingOrder);

export default paymentRouter;
