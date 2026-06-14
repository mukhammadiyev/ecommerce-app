const rateLimit = require('express-rate-limit'); 
const AppError = require('../utils/appError');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  

  max: process.env.NODE_ENV === 'production' ? 100 : 2000, 

  handler: (req, res, next) => {
    next(new AppError("Haddan tashqari ko'p so'rov yuborildi! Iltimos, 15 daqiqadan so'ng urinib ko'ring.", 429));
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = globalLimiter;