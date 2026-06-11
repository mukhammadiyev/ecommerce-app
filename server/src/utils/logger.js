const logger = require('../utils/logger'); // Sizdagi logger ulandi 📈

module.exports = (err, req, res, next) => {
  // Xatolikni tizim logiga yozish
  if (logger && typeof logger.error === 'function') {
    logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  } else {
    console.error("🚨 XATOLIK:", err.stack);
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Tizimli kutilmagan xatolar (masalan DB o'chib qolsa)
  res.status(500).json({
    success: false,
    message: "Serverda ichki xatolik yuz berdi. Iltimos keyinroq urinib ko'ring!",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};