const express = require("express");
const apiRouter = express.Router();

const cityRouter = require('./city')
const locationRouter = require('./locations')
const couponRouter = require('./coupon')
const bannerRouter = require('./banner')

apiRouter.use('/cities', cityRouter)
apiRouter.use('/locations', locationRouter)
apiRouter.use('/coupons', couponRouter);
apiRouter.use('/banners', bannerRouter);

module.exports = apiRouter;