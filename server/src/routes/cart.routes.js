const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');
const { cartSchema } = require('../validators/cart.validator');

// Barcha yo'llar avtomatizatsiyalashgan holda login qilganlar uchun 🔒
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/add', validate(cartSchema), cartController.addToCart); 

// Yangi qo'shilgan yo'llar 🆕
router.put('/items/:id', cartController.updateCartItem);     // Savatdagi mahsulot miqdorini o'zgartirish
router.delete('/items/:id', cartController.removeFromCart);  // Savatdan mahsulotni o'chirish

module.exports = router;