const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload'); // 🆕 Rasm yuklash middleware-ni chaqiramiz

// Ochiq yo'l (Hamma ko'ra oladi)
router.get('/', categoryController.getAllCategories);

// Himoyalangan yo'llar (Faqat adminlar uchun va rasm yuklash imkoniyati bilan) 🔒
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), categoryController.createCategory);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), categoryController.updateCategory); 

module.exports = router;