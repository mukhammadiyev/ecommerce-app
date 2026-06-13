const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const authMiddleware = require('../middleware/auth');

// Hamma yo'llar login talab qiladi 🔒
router.use(authMiddleware);

router.get('/me', addressController.getMyAddress);
router.post('/', addressController.saveAddress);
router.put('/', addressController.updateAddress);
router.delete('/', addressController.deleteAddress);

module.exports = router;