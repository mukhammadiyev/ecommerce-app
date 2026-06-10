const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Mana bu yerga '/' o'rniga '/add' deb yozamiz:
router.post('/add', cartController.addToCart); 
router.get('/', cartController.getCart);

module.exports = router;