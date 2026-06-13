const { Newsletter } = require('../models/associations'); // ⚙️ Markaziy fayldan import qilamiz
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Yangi emailni obunachilar ro'yxatiga qo'shish
exports.subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  const existing = await Newsletter.findOne({ where: { email } });
  if (existing) {
    throw new AppError("Bu email allaqachon obuna bo'lgan", 400);
  }

  const subscription = await Newsletter.create({ email });
  return ApiResponse.send(res, "Obuna muvaffaqiyatli yakunlandi! 📬", subscription, 201);
};

// 2. Admin uchun barcha obunachilarni olish
exports.getAllSubscribersForAdmin = async (req, res) => {
  const subscribers = await Newsletter.findAll({ order: [['createdAt', 'DESC']] });
  return ApiResponse.send(res, "Obunachilar ro'yxati", subscribers);
};