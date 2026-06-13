const emailService = require('../services/email.service');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

exports.sendCustomEmail = async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  // 1. Majburiy maydonlarni tekshirish
  if (!to || !subject || !htmlContent) {
    throw new AppError("Email, mavzu va xat matni kiritilishi shart!", 400);
  }

  // 2. Email xizmati orqali xatni yo'lga qo'yish
  // (emailService ichida nodemailer o'rnatilgan deb hisoblaymiz)
  await emailService.sendEmail({ 
    to, 
    subject, 
    html: htmlContent 
  });

  // Standart bo'yicha ma'lumot bo'lmagani uchun null qaytaramiz
  return ApiResponse.send(res, "Xat muvaffaqiyatli yuborildi! ✉️", null);
};