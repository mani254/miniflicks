const express = require("express");
const apiRouter = express.Router();

const cityRouter = require('./city')

apiRouter.use('/cities', cityRouter)

module.exports = apiRouter;