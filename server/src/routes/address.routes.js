const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const authMiddleware = require('../middleware/auth');

// VALIDATSIYA:
const validate = require('../middleware/validation');
const { addressSchema } = require('../validators/address.validator'); 

// Barcha yo'llar faqat login qilgan foydalanuvchilar uchun 🔒
router.use(authMiddleware);

router.get('/', addressController.getMyAddress);
router.post('/save', validate(addressSchema), addressController.saveAddress);

// Yangi qo'shilgan yo'llar 🆕
router.put('/update', validate(addressSchema), addressController.updateAddress); // Manzilni yangilash
router.delete('/delete', addressController.deleteAddress);                     // Manzilni o'chirish

module.exports = router;