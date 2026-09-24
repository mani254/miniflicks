import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';
import { VerifyPaymentSchema } from '../bookings/booking.validators';
import {
  verifyPaymentService,
  cancelPaymentService,
} from './payment.service';

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

