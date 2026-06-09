const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // Savatcha to'liq auth bilan himoyalandi

router.post('/', cartController.addToCart);
router.get('/', cartController.getCart);

module.exports = router;