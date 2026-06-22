const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth'); // Login tekshiruvi
const adminMiddleware = require('../middleware/admin'); // 👈 Admin ekanligini tekshiruvchi middleware
const validate = require('../middleware/validation');
const { orderSchema } = require('../validators/order.validator');

// ── 1. BARCHA FOYDALANUVCHILAR UCHUN (LOGIN MAJBURIY) ──
router.use(authMiddleware); 

router.post('/checkout', validate(orderSchema), orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.put('/:id/cancel', orderController.cancelMyOrder);

// ── 2. FAQAT ADMINLAR UCHUN YO'LAKLAR (FRONTEND SHULARNI CHAQIRADI) ──
// [GET] /api/orders/admin/all -> Frontend sidebar va jadval uchun
router.get('/admin/all', adminMiddleware, orderController.getAllOrdersForAdmin);

// [PUT] /api/orders/:id/status -> Statusni o'zgartirish uchun
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);

module.exports = router;