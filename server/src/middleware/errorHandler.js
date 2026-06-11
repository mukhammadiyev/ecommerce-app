const logger = require('../utils/logger'); // Sizdagi logger ulandi

module.exports = (err, req, res, next) => {
  // Xatolikni faylga yoki konsolga yozish
  if (logger && typeof logger.error === 'function') {
    logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  } else {
    console.error("🚨 XATOLIK:", err.stack);
  }

  // Agar biz o'zimiz bilib otgan xatolik bo'lsa (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Kutilmagan tizimli xatolar (masalan, baza o'chib qolsa)
  res.status(500).json({
    success: false,
    message: "Serverda ichki xatolik yuz berdi. Iltimos keyinroq urinib ko'ring!",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};