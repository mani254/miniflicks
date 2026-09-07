import { Router } from 'express';
import { requireAuth, requireSuperAdmin } from '../../middleware/auth.middleware';
import {
  getBookings,
  getBooking,
  createAdminBooking,
  createCustomerBooking,
  updateBooking,
  deleteBooking,
  getBookedSlots,
  getDashboardInfo,
  getGraphData,
} from './booking.controller';

const bookingRouter = Router();

// ─── Public routes (no auth required) ────────────────────────────────────────
bookingRouter.post('/getBookedSlots', getBookedSlots);  // Used by customer booking form
bookingRouter.post('/customerBooking', createCustomerBooking);  // Customer Razorpay flow

// ─── Admin routes (any authenticated admin) ───────────────────────────────────
bookingRouter.get('/', requireAuth, getBookings);
bookingRouter.post('/', requireAuth, createAdminBooking);
bookingRouter.put('/', requireAuth, updateBooking);
bookingRouter.get('/info', requireAuth, getDashboardInfo);
bookingRouter.get('/graphData', requireAuth, getGraphData);
bookingRouter.get('/:id', requireAuth, getBooking);
bookingRouter.delete('/:id', requireAuth, deleteBooking);

export default bookingRouter;
