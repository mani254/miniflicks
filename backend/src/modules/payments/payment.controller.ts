import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { ValidationError, PaymentError } from '../../shared/errors/AppError';
import { VerifyPaymentSchema } from '../bookings/booking.validators';
import {
  verifyPaymentService,
  cancelPaymentService,
  handleWebhookEvent,
  verifyWebhookSignature,
  type RazorpayWebhookEvent,
} from './payment.service';

const RAZORPAY_WEBHOOK_SECRET = process.env['RAZORPAY_WEBHOOK_SECRET'] ?? '';

/** POST /api/payments/verify — verify Razorpay payment signature */
export const verifyPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = VerifyPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Invalid payment verification data', parsed.error.issues);
  }

  const booking = await verifyPaymentService({
    razorpay_order_id: parsed.data.razorpay_order_id,
    razorpay_payment_id: parsed.data.razorpay_payment_id,
    razorpay_signature: parsed.data.razorpay_signature,
  });

  sendSuccess(res, { booking, message: 'Payment verified successfully' });
});

/** POST /api/payments/cancel — cancel pending payment */
export const cancelPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.body as { orderId?: string };
  if (!orderId) {
    throw new ValidationError('orderId is required');
  }

  await cancelPaymentService(orderId);
  sendSuccess(res, { message: 'Payment cancelled successfully' });
});

/**
 * POST /api/payments/webhook — Razorpay webhook receiver.
 *
 * IMPORTANT: This route must receive the raw request body for signature verification.
 * Make sure to register this route BEFORE express.json() middleware, or use
 * express.raw() specifically for this route.
 */
export const razorpayWebhook = (req: Request, res: Response, next: NextFunction): void => {
  const signature = req.headers['x-razorpay-signature'];

  if (!signature || typeof signature !== 'string') {
    console.warn('[Webhook] Request missing X-Razorpay-Signature header');
    res.status(400).json({ success: false, error: { code: 'MISSING_SIGNATURE', message: 'Missing webhook signature' } });
    return;
  }

  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured');
    res.status(500).json({ success: false, error: { code: 'CONFIG_ERROR', message: 'Webhook not configured' } });
    return;
  }

  // req.body must be raw buffer for signature verification
  const rawBody = req.body instanceof Buffer
    ? req.body.toString('utf8')
    : JSON.stringify(req.body);

  const isValid = verifyWebhookSignature(rawBody, signature, RAZORPAY_WEBHOOK_SECRET);

  if (!isValid) {
    console.warn('[Webhook] Invalid signature received');
    res.status(400).json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' } });
    return;
  }

  // Parse and process event
  let event: RazorpayWebhookEvent;
  try {
    event = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as RazorpayWebhookEvent;
  } catch {
    res.status(400).json({ success: false, error: { code: 'INVALID_BODY', message: 'Invalid JSON payload' } });
    return;
  }

  // Always acknowledge to Razorpay immediately (even if processing fails)
  // Razorpay retries if it doesn't get 200 in time
  res.status(200).json({ success: true });

  // Process asynchronously after responding
  void handleWebhookEvent(event).catch((err: unknown) => {
    console.error('[Webhook] Error processing event:', err);
  });

  void next;
};

/** DELETE /api/payments/pending/:orderId — admin: delete a pending order (fixes H9 — soft cancel) */
export const deletePendingOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params as { orderId: string };

    if (!orderId) {
      throw new ValidationError('orderId is required');
    }

    await cancelPaymentService(orderId);
    sendSuccess(res, { message: 'Pending order cancelled' });
  },
);
