const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.use(authMiddleware);

router.post('/process', paymentController.processPayment);

// Admin yo'llari 👑
router.get('/admin/all', adminMiddleware, paymentController.getAllPaymentsForAdmin); 
router.put('/admin/:id/status', adminMiddleware, paymentController.updatePaymentStatus); 

module.exports = router;