const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const validate = require('../middleware/validation');
const { contactSchema } = require('../validators/contact.validator');

// Ochiq yo'l: Har kim xabar qoldira oladi
router.post('/', validate(contactSchema), contactController.createContactMessage);

// Himoyalangan yo'llar: Faqat Admin ko'ra oladi va o'chira oladi 🔒
router.get('/admin', authMiddleware, adminMiddleware, contactController.getAllMessagesForAdmin);
router.delete('/admin/:id', authMiddleware, adminMiddleware, contactController.deleteMessage); // 🆕 Xabarni o'chirish

module.exports = router;