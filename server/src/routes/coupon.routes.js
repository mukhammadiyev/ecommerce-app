const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// 🔒 Oddiy foydalanuvchilar kupon kiritib tekshira olishi uchun endpoint (adminMiddleware YO'Q)
router.get('/check/:code', authMiddleware, couponController.checkCoupon);

// 🛠️ Kuponlar boshqaruvi (Faqat adminlar uchun)
router.get('/', authMiddleware, adminMiddleware, couponController.getAllCoupons);
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

module.exports = router;