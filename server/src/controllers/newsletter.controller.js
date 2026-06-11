const Newsletter = require('../models/Newsletter');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

exports.subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  const existing = await Newsletter.findOne({ where: { email } });
  if (existing) {
    throw new AppError("Bu email allaqachon obuna bo'lgan", 400);
  }

  const subscription = await Newsletter.create({ email });
  return ApiResponse.send(res, "Obuna muvaffaqiyatli yakunlandi! 📬", subscription, 201);
};

exports.getAllSubscribersForAdmin = async (req, res) => {
  const subscribers = await Newsletter.findAll();
  return ApiResponse.send(res, "Obunachilar ro'yxati", subscribers);
};