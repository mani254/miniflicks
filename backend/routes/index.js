const express = require("express");
const apiRouter = express.Router();

const cityRouter = require('./city')
const locationRouter = require('./locations')
const couponRouter = require('./coupon')
const bannerRouter = require('./banner');
const giftRouter = require("./gift");
const addonRouter = require("./addon");
const screenRouter = require("./screen");


apiRouter.use('/cities', cityRouter)
apiRouter.use('/locations', locationRouter)
apiRouter.use('/coupons', couponRouter);
apiRouter.use('/banners', bannerRouter);
apiRouter.use('/gifts', giftRouter)
apiRouter.use('/addons', addonRouter)
apiRouter.use('/screens', screenRouter)

module.exports = apiRouter;