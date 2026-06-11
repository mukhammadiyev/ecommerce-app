const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// VALIDATSIYA QO'SHILDI:
const validate = require('../middleware/validation');
const { sendEmailSchema } = require('../validators/email.validator');

// Admin paneldan email yuborish qismi uchun
router.post('/send', authMiddleware, adminMiddleware, validate(sendEmailSchema), emailController.sendCustomEmail);

module.exports = router;