const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/', categoryController.getAllCategories);

// Kategoriya qo'shishni ham faqat admin uchun xavfsiz qildik
router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);

module.exports = router;