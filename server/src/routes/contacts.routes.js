const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Saytga kelgan har qanday odam xabar qoldira olishi uchun (Auth shart emas)
router.post('/', contactController.createContactMessage);

// Faqat admin ko'ra olishi uchun
router.get('/admin', authMiddleware, adminMiddleware, contactController.getAllMessagesForAdmin);

module.exports = router;