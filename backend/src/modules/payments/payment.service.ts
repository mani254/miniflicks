import crypto from 'crypto';
import { getRazorpaySecret } from '../../config/razorpay';
import { PaymentError, BusinessRuleError, NotFoundError } from '../../shared/errors/AppError';
import { confirmBookingPaymentService, cancelBookingByOrderIdService } from '../bookings/booking.service';
import type { IBooking } from '../bookings/booking.schema';

// ─── Signature Verification ────────────────────────────────────────────────────

/**
 * Verifies the Razorpay payment signature.
 *
 * IMPORTANT SECURITY NOTES:
 * - Signature is verified BEFORE any DB lookup (fixes M2)
 * - Key secret comes from env/config, NOT from the SDK instance (fixes C2)
 * - Uses timing-safe comparison to prevent timing attacks
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const keySecret = getRazorpaySecret();

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  // Timing-safe comparison prevents timing-based signature oracle attacks
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

/**
 * Verifies the Razorpay webhook signature.
 * Different from payment verification — uses the raw request body as the body.
 */
export function verifyWebhookSignature(
  rawBody: string,
  webhookSignature: string,
  webhookSecret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(webhookSignature, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

// ─── Payment Verification (Frontend-initiated) ─────────────────────────────────

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amountPaidRupees?: number;
}

export async function verifyPaymentService(input: VerifyPaymentInput): Promise<IBooking> {
  // 1. Verify signature FIRST before any DB call (fixes M2)
  const isValid = verifyRazorpaySignature(
    input.razorpay_order_id,
    input.razorpay_payment_id,
    input.razorpay_signature,
  );

  if (!isValid) {
    throw new PaymentError('Payment signature verification failed', 'PAYMENT_SIGNATURE_INVALID');
  }

  // 2. Confirm the booking in DB
  const booking = await confirmBookingPaymentService(
    input.razorpay_order_id,
    input.razorpay_payment_id,
    input.amountPaidRupees ?? 0,
  );

  return booking;
}

// ─── Cancel Payment ────────────────────────────────────────────────────────────

export async function cancelPaymentService(orderId: string): Promise<void> {
  if (!orderId) throw new BusinessRuleError('Order ID is required');
  await cancelBookingByOrderIdService(orderId, 'Customer cancelled payment');
}

// ─── Razorpay Webhook Handler (fixes C3) ──────────────────────────────────────

export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        status?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
        amount_paid?: number;
      };
    };
  };
}

export async function handleWebhookEvent(
  event: RazorpayWebhookEvent,
): Promise<void> {
  const { payload } = event;

  switch (event.event) {
    case 'payment.captured':
    case 'order.paid': {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const amountPaise = paymentEntity?.amount ?? 0;

      if (!orderId || !paymentId) {
        console.warn('[Webhook] payment.captured event missing orderId or paymentId');
        return;
      }

      try {
        await confirmBookingPaymentService(orderId, paymentId, amountPaise / 100);
        console.log(`[Webhook] Booking confirmed for order ${orderId}`);
      } catch (err) {
        if (err instanceof NotFoundError) {
          // Booking already confirmed or doesn't exist — idempotent, ignore
          console.warn(`[Webhook] Booking for order ${orderId} not found (may already be confirmed)`);
          return;
        }
        if (err instanceof BusinessRuleError) {
          // Already in BOOKED status — idempotent, ignore
          console.warn(`[Webhook] Booking for order ${orderId} business rule: ${err.message}`);
          return;
        }
        throw err;
      }
      break;
    }

    case 'payment.failed': {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (!orderId) {
        console.warn('[Webhook] payment.failed event missing orderId');
        return;
      }

      try {
        await cancelBookingByOrderIdService(orderId, 'Payment failed via webhook');
        console.log(`[Webhook] Booking canceled for failed payment, order ${orderId}`);
      } catch (err) {
        if (err instanceof NotFoundError || err instanceof BusinessRuleError) {
          // Already canceled or doesn't exist — idempotent
          return;
        }
        throw err;
      }
      break;
    }

    default:
      // Unknown event — silently acknowledge to Razorpay
      console.log(`[Webhook] Unhandled event type: ${event.event}`);
  }
}
