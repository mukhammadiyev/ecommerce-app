const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const authMiddleware = require('../middleware/auth');

// Foydalanuvchi o'z buyurtmasi uchun hisob-fakturani olishi/yuklashi
router.get('/:orderId', authMiddleware, invoiceController.getInvoiceByOrderId);

module.exports = router;