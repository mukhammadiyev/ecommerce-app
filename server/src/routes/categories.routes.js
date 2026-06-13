const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller'); // ⚙️ Controllerga ulanadi
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Ochiq yo'l (Hamma ko'ra oladi)
router.get('/', categoryController.getAllCategories);

// Himoyalangan yo'llar (Faqat Adminlar yarata oladi va o'chira oladi) 🔒
router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;