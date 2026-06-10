const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

// Barcha profil endpointlari uchun login majburiy qilinadi
router.use(authMiddleware);

router.get('/profile', userController.getProfile);         // GET /api/users/profile
router.put('/profile', userController.updateProfile);      // PUT /api/users/profile
router.put('/password', userController.updatePassword);    // PUT /api/users/password

module.exports = router;