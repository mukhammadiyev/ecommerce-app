const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Mahsulot yaratishni faqat admin qila oladigan qilamiz xavfsizlik uchun
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);

module.exports = router;