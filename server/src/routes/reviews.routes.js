const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth');

// Sharh yozish uchun profilga kirgan bo'lish shart (authMiddleware)
router.post('/', authMiddleware, reviewController.addReview);

// Mahsulot sharhlarini ko'rish esa hammaga ochiq (public)
router.get('/:productId', reviewController.getProductReviews);

module.exports = router;