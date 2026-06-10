const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.use(authMiddleware); 

router.post('/checkout', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);

// Admin amallari
router.get('/admin/all', adminMiddleware, orderController.getAllOrdersForAdmin);
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);

module.exports = router;