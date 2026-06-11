const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validation'); 
const { registerSchema, loginSchema } = require('../validators/auth.validator'); 
const authLimiter = require('../middleware/emailLimiter'); // 🔥 Kuchaytirilgan limiter ulandi

// authLimiter yo'nalishlarga controllerdan oldin middleware sifatida qo'shildi
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

module.exports = router;