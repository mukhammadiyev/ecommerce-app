const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Hamma mahsulotlarni olish va qidirish
router.get('/', productController.getAllProducts);

// BITTA MAHSULOTNI ID BO'YICHA OLISH (Mana shu qator borligini tekshiring!)
router.get('/:id', productController.getProductById);

// Mahsulot qo'shish (Admin)
router.post('/', productController.createProduct);

module.exports = router;