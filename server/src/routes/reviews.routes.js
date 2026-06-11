const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');
const { reviewSchema } = require('../validators/review.validator'); 

// Ochiq yo'l (Hamma ko'ra oladi)
router.get('/:productId', reviewController.getProductReviews);

// Himoyalangan yo'llar (Faqat login qilganlar uchun) 🔒
router.post('/', authMiddleware, validate(reviewSchema), reviewController.addReview);
router.put('/:id', authMiddleware, reviewController.updateReview);     // 🆕 O'z sharhini tahrirlash
router.delete('/:id', authMiddleware, reviewController.deleteReview);  // 🆕 O'z sharhini yoki admin o'chirishi

module.exports = router;