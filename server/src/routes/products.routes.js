const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Mahsulot yaratish (Faqat Admin yoki Manager)
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);

// Barcha mahsulotlarni olish (Ochiq hamma ko'ra oladi)
router.get('/', productController.getAllProducts);

module.exports = router;