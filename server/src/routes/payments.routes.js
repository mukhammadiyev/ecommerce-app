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

router.get('/cards', authMiddleware, paymentController.getUserCards);
router.post('/cards', authMiddleware, paymentController.addUserCard);
router.put('/cards/:id/default', paymentController.setDefaultCard);
router.delete('/cards/:id', paymentController.deleteUserCard);
module.exports = router;