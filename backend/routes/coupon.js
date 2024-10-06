const express = require('express');
const couponRouter = express.Router();

const { addCoupon, getCoupons, deleteCoupon, updateCoupon } = require('../controllers/couponController');

couponRouter.post('/', addCoupon);
couponRouter.get('/', getCoupons);
couponRouter.delete('/:id', deleteCoupon);
couponRouter.put('/:id', updateCoupon);

module.exports = couponRouter;
