const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Barcha to'lov amallari xavfsiz bo'lishi shart 🔒
router.use(authMiddleware);

// Foydalanuvchi to'lov qilishi
router.post('/process', paymentController.processPayment);

// Admin uchun yangi qo'shilgan yo'llar 👑
router.get('/admin/all', adminMiddleware, paymentController.getAllPaymentsForAdmin); // Barcha to'lovlarni ko'rish
router.put('/admin/:id/status', adminMiddleware, paymentController.updatePaymentStatus); // To'lov statusini o'zgartirish

module.exports = router;