const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// VALIDATSIYA:
const validate = require('../middleware/validation');
const { orderSchema } = require('../validators/order.validator');

// Barcha yo'llar login talab qiladi 🔒
router.use(authMiddleware); 

router.post('/checkout', validate(orderSchema), orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.put('/:id/cancel', orderController.cancelMyOrder); // 🆕 Foydalanuvchi o'z buyurtmasini bekor qilishi

// Faqat Adminlar uchun yo'llar 👑
router.get('/admin/all', adminMiddleware, orderController.getAllOrdersForAdmin);
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);

module.exports = router;