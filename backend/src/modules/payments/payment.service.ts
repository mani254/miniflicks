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
    input.amountPaidRupees,
  );

  return booking;
}

// ─── Cancel Payment ────────────────────────────────────────────────────────────

export async function cancelPaymentService(orderId: string): Promise<void> {
  if (!orderId) throw new BusinessRuleError('Order ID is required');
  await cancelBookingByOrderIdService(orderId, 'Customer cancelled payment');
}

