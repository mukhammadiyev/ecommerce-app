const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Ochiq yo'llar (Hamma ko'ra oladi)
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Himoyalangan yo'l (Faqat admin blog qo'sha oladi)
router.post('/', authMiddleware, adminMiddleware, blogController.createBlog);

module.exports = router;