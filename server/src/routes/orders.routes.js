const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// 1. HAMMA yo'laklar uchun oldin login (token) majburiy bo'lishi kerak!
router.use(authMiddleware); 

// 2. Oddiy xaridorlar qila oladigan amallar
router.post('/checkout', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);

// 3. Faqat ADMIN qila oladigan amallar (authMiddleware'dan pastda turishi SHART)
router.get('/admin/all', adminMiddleware, orderController.getAllOrdersForAdmin);
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);

module.exports = router;