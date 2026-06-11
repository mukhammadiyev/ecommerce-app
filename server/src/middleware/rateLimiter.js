const rateLimit = require('express-rate-limit'); // 🔥 Faqat shu paketning o'zi qoldi
const AppError = require('../utils/appError');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 100, // 100 ta so'rov
  handler: (req, res, next) => {
    next(new AppError("Haddan tashqari ko'p so'rov yuborildi! Iltimos, 15 daqiqadan so'ng urinib ko'ring.", 429));
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = globalLimiter;