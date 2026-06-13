const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller'); // ⚙️ Fayl nomi moslashtirildi
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/dashboard', authMiddleware, adminMiddleware, analyticsController.getDashboardStats);

module.exports = router;