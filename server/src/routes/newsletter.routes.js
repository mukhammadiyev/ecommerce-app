const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const validate = require('../middleware/validation');
const { newsletterSchema } = require('../validators/newsletter.validator');

router.post('/subscribe', validate(newsletterSchema), newsletterController.subscribeNewsletter);
router.get('/admin', authMiddleware, adminMiddleware, newsletterController.getAllSubscribersForAdmin);

module.exports = router;