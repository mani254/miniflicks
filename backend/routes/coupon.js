const express = require('express');
const couponRouter = express.Router();
const CouponController = require('../controllersClass/couponController');


couponRouter.post('/', CouponController.addCoupon);
couponRouter.get('/', CouponController.getCoupons);
couponRouter.delete('/:id', CouponController.deleteCoupon);
couponRouter.put('/:id', CouponController.updateCoupon);

module.exports = couponRouter;
