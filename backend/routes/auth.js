const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js')

router.post('/loginAdmin', authController.loginAdmin)
router.post('/registerAdmin', authController.registerAdmin)

module.exports = router;