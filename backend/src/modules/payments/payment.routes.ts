import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { verifyPayment, cancelPayment, deletePendingOrder } from './payment.controller';

const paymentRouter = Router();

/** Customer-facing routes */
paymentRouter.post('/verify', verifyPayment);
paymentRouter.post('/cancel', cancelPayment);

/** Admin routes */
paymentRouter.delete('/pending/:orderId', requireAuth, deletePendingOrder);

export default paymentRouter;
