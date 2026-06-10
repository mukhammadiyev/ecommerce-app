const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Routerda chaqirilgan funksiya nomi controllerdagi getMyAddress'ga moslab to'g'rilandi
router.get('/', addressController.getMyAddress);
router.post('/save', addressController.saveAddress);

module.exports = router;