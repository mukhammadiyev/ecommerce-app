const Contact = require('../models/Contact');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Foydalanuvchidan kelgan xabarni saqlash
exports.createContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  const newMessage = await Contact.create({ name, email, message });
  return ApiResponse.send(res, "Xabaringiz adminga yetkazildi", newMessage, 201);
};

// 2. Admin uchun barcha xabarlarni olish
exports.getAllMessagesForAdmin = async (req, res) => {
  const messages = await Contact.findAll({ order: [['createdAt', 'DESC']] });
  return ApiResponse.send(res, "Barcha xabarlar ro'yxati (Admin)", messages);
};

// 3. Admin xabarlarni o'chirishi (DELETE) 🆕
exports.deleteMessage = async (req, res) => {
  const { id } = req.params;

  const message = await Contact.findByPk(id);
  if (!message) {
    throw new AppError("O'chirish uchun xabar topilmadi", 404);
  }

  await message.destroy();

  return ApiResponse.send(res, "Xabar muvaffaqiyatli o'chirildi! 🗑️");
};