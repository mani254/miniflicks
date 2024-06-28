const express = require("express");
const apiRouter = express.Router();

const locationRouter = require("./location.js");
const cityRouter = require("./city.js");
const authRouter = require('./auth.js');
const bannerRouter = require('./banner.js')
// Define routes
apiRouter.use("/locations", locationRouter);
apiRouter.use("/cities", cityRouter);
apiRouter.use('/banners', bannerRouter);
apiRouter.use('/auth', authRouter)


module.exports = apiRouter;