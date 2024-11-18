const express = require('express');
const authRouter = express.Router();
const Controller = require('../controllersClass/authController');

const { superAdminAuth } = require('../middleware/authorization')
const authController = new Controller()

authRouter.post('/login', authController.login)
authRouter.post('/register', superAdminAuth, authController.registerSuperAdmin)
authRouter.post('/initialLogin', authController.initialLogin)
authRouter.post('/logout', authController.logout)

module.exports = authRouter;