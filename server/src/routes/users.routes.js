// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, userController.getProfile);
// src/routes/user.routes.js ichida:
router.put('/profile', authMiddleware, userController.updateProfile); 
router.put('/password', authMiddleware, userController.updatePassword);

module.exports = router;