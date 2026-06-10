const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Footer formasi uchun (Hamma obuna bo'la oladi)
router.post('/subscribe', newsletterController.subscribeNewsletter);

// Faqat admin obunachilar ro'yxatini ko'ra oladi
router.get('/admin', authMiddleware, adminMiddleware, newsletterController.getAllSubscribersForAdmin);

module.exports = router;