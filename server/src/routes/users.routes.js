const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');
const { updateProfileSchema, changePasswordSchema } = require('../validators/user.validator');

// Barcha so'rovlar login qilganlar uchun
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put('/password', validate(changePasswordSchema), userController.updatePassword);
router.delete('/profile', userController.deleteAccount); // Akkauntni o'chirish

module.exports = router;