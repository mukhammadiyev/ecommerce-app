const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

// Ochiq yo'llar
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Himoyalangan yo'llar (Faqat adminlar uchun) 🔒
router.post(
  '/', 
  authMiddleware, 
  adminMiddleware, 
  upload.fields([
    { name: 'image', maxCount: 1 },    // Asosiy rasm
    { name: 'gallery', maxCount: 5 }   // Qo'shimcha galereya rasmlari
  ]), 
  blogController.createBlog
);

router.put(
  '/:id', 
  authMiddleware, 
  adminMiddleware, 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]), 
  blogController.updateBlog
);

router.delete('/:id', authMiddleware, adminMiddleware, blogController.deleteBlog);

module.exports = router;