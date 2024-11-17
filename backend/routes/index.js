const express = require("express");
const apiRouter = express.Router();

const cityRouter = require('./city')
const locationRouter = require('./locations')
const couponRouter = require('./coupon')
const bannerRouter = require('./banner');
const giftRouter = require("./gift");
const addonRouter = require("./addon");
const screenRouter = require("./screen");
const bookingRouter = require("./booking");
const customerRouter = require("./customer")
const authRouter = require('./authRouter');
const occasionRouter = require("./occasion");
const cakeRouter = require('./cake');
const sendContactForm = require('../utils/sendContactForm')

apiRouter.use('/cities', cityRouter)
apiRouter.use('/locations', locationRouter)
apiRouter.use('/coupons', couponRouter);
apiRouter.use('/banners', bannerRouter);
apiRouter.use('/gifts', giftRouter)
apiRouter.use('/addons', addonRouter)
apiRouter.use('/screens', screenRouter)
apiRouter.use('/bookings', bookingRouter)
apiRouter.use('/customers', customerRouter)
apiRouter.use('/auth', authRouter)
apiRouter.use('/occasions', occasionRouter)
apiRouter.use("/cakes", cakeRouter)
apiRouter.post('/sendContactForm', sendContactForm);


module.exports = apiRouter;