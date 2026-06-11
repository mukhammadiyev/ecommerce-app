const rateLimit = require('express-rate-limit');
const AppError = require('../utils/appError');

// Login, Register va parolni tiklash sahifalari uchun maxsus cheklov
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 soat ichida
  max: 5, // bitta IPdan ko'pi bilan 5 marta xato urinishga ruxsat
  handler: (req, res, next) => {
    next(new AppError("Xavfsizlik tizimi: Judayam ko'p urinish bo'ldi. Iltimos, 1 soatdan keyin qayta urinib ko'ring!", 429));
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = authLimiter;