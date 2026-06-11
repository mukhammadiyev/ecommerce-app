const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload'); // 🆕 Middleware yuklanmoqda

// Ochiq yo'llar (Hamma ko'ra oladi)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Himoyalangan yo'llar (Faqat Adminlar uchun) 🔒
router.post(
  '/', 
  authMiddleware, 
  adminMiddleware, 
  upload.fields([
    { name: 'image', maxCount: 1 },    // 🆕 Asosiy rasm uchun
    { name: 'gallery', maxCount: 5 }   // 🆕 Galereya rasmlari uchun (maks 5 ta)
  ]), 
  productController.createProduct
);

router.put(
  '/:id', 
  authMiddleware, 
  adminMiddleware, 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]), 
  productController.updateProduct
);

router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;