const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Dashboard statistikasini olish (Faqat adminlar uchun)
router.get('/dashboard', authMiddleware, adminMiddleware, analyticsController.getDashboardStats);

module.exports = router;