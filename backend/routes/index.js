const express = require("express");
const apiRouter = express.Router();

const cityRouter = require('./city')
const locationRouter = require('./locations')

apiRouter.use('/cities', cityRouter)
apiRouter.use('/locations', locationRouter)

module.exports = apiRouter;