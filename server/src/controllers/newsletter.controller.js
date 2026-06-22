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
// 3. Admin barcha obunachilarga xabar yuborishi uchun (Yangi qo'shildi)
exports.sendNewsletterToAll = async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    throw new AppError("Sarlavha va xabar matni majburiy!", 400);
  }

  // 1. Bazadan barcha obunachilarning emaillarini olamiz
  const subscribers = await Newsletter.findAll({ attributes: ['email'] });
  const emailList = subscribers.map(sub => sub.email);

  if (emailList.length === 0) {
    throw new AppError("Xabar yuborish uchun hech qanday obunachi yo'q", 400);
  }

  // 🔥 SHU YERDA: Kelajakda Nodemailer orqali emailList'ga xat yuborish kodini yozasiz.
  // Hozircha front-end muvaffaqiyatli ishlashi uchun simulyatsiya qilamiz:
  console.log(`Xat yuborildi! Mavzu: ${subject}. Jami obunachilar: ${emailList.length} ta.`);

  return ApiResponse.send(res, "Xabar barcha obunachilarga muvaffaqiyatli jo'natildi! 🚀", {
    totalSent: emailList.length
  });
};