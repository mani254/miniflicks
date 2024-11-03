const express = require('express');
const couponRouter = express.Router();
const CouponController = require('../controllersClass/couponController');

const { superAdminAuth } = require('../middleware/authorization')

couponRouter.post('/', superAdminAuth, CouponController.addCoupon);
couponRouter.get('/', superAdminAuth, CouponController.getCoupons);
couponRouter.delete('/:id', superAdminAuth, CouponController.deleteCoupon);
couponRouter.put('/:id', superAdminAuth, CouponController.updateCoupon);
couponRouter.post('/validate', CouponController.validateCoupon);

module.exports = couponRouter;
