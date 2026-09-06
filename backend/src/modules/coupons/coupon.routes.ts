import { Router, type Request, type Response, type NextFunction } from 'express';
import { createCrudRouter } from '../../shared/utils/crudRouter';
import { Coupon } from './coupon.schema';
import { validateCouponExpiry } from '../pricing/pricing.service';

const couponRouter = Router();

// GET /getUserCoupons — Only active, non-expired coupons marked for scrolling header
couponRouter.get('/getUserCoupons', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      status: true,
      $or: [{ scrollCoupon: true }, { showInHeader: true }],
      expireDate: { $gte: now },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      coupons,
      data: coupons,
      totalDocuments: coupons.length,
    });
  } catch (err) {
    next(err);
  }
});

// POST /validate — Validate coupon code
couponRouter.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, date } = req.body as { code?: string; date?: string };
    if (!code) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Coupon code is required' } });
      return;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon || !coupon.status) {
      res.status(404).json({ success: false, error: { code: 'INVALID_COUPON', message: 'Invalid or inactive coupon code' } });
      return;
    }

    const bookingDate = date ? new Date(date) : new Date();
    const isValid = validateCouponExpiry(coupon.expireDate, bookingDate);
    if (!isValid) {
      res.status(400).json({ success: false, error: { code: 'EXPIRED_COUPON', message: 'This coupon has expired' } });
      return;
    }

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (err) {
    next(err);
  }
});

// Mount CRUD operations for admin (GET /, GET /:id, POST /, PUT /:id, DELETE /:id)
couponRouter.use(createCrudRouter(Coupon, 'coupon', 'coupons'));

export default couponRouter;
