const express = require("express");
const apiRouter = express.Router();

const cityRouter = require('./city')
const locationRouter = require('./locations')
const couponRouter = require('./coupon')
const bannerRouter = require('./banner');
const giftRouter = require("./gift");

apiRouter.use('/cities', cityRouter)
apiRouter.use('/locations', locationRouter)
apiRouter.use('/coupons', couponRouter);
apiRouter.use('/banners', bannerRouter);
apiRouter.use('/gifts', giftRouter)

module.exports = apiRouter;