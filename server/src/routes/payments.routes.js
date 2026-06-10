const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');

router.post('/process', authMiddleware, paymentController.processPayment);

module.exports = router;