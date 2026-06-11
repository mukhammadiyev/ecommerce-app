const emailService = require('../services/email.service');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

exports.sendCustomEmail = async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || !subject || !htmlContent) {
    throw new AppError("Email, mavzu va xat matni kiritilishi shart!", 400);
  }

  await emailService.sendEmail({ to, subject, html: htmlContent });

  return ApiResponse.send(res, "Xat muvaffaqiyatli yuborildi! ✉️");
};