const express = require('express');
const authRouter = express.Router();
const Controller = require('../controllersClass/authController')

const authController = new Controller()

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.registerSuperAdmin)
authRouter.post('/initialLogin', authController.initialLogin)

module.exports = authRouter;