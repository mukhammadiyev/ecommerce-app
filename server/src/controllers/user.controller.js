const { User, Address } = require('../models/associations'); // ⚙️ Markaziy fayldan import qilamiz
const bcrypt = require('bcryptjs');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Profil ma'lumotlarini olish (Bog'langan manzil bilan birga)
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Address, as: 'address' } // 🆕 Foydalanuvchining alohida manzillar jadvalidagi ma'lumotlarini ham qo'shib qaytaramiz
    ]
  });

  if (!user) {
    throw new AppError("Foydalanuvchi topilmadi.", 404);
  }

  return ApiResponse.send(res, "Profil ma'lumotlari keltirildi", user);
};

// 2. Profil ma'lumotlarini tahrirlash
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, phone_number, shipping_address } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("Foydalanuvchi topilmadi.", 404);
  }

  user.first_name = first_name !== undefined ? first_name : user.first_name;
  user.last_name = last_name !== undefined ? last_name : user.last_name;
  user.phone_number = phone_number !== undefined ? phone_number : user.phone_number;

  // 🆕 Agar alohida Address modeli ishlatilayotgan bo'lsa va req.body'dan yangi manzil kelsa:
  if (shipping_address !== undefined) {
    // Avval shu foydalanuvchining manzili bormi tekshiramiz
    let addressRecord = await Address.findOne({ where: { user_id: userId } });
    if (addressRecord) {
      addressRecord.address_line = shipping_address; // Modelizdagi ustun nomiga qarab moslaysiz (masalan: address_line)
      await addressRecord.save();
    } else {
      await Address.create({ user_id: userId, address_line: shipping_address });
    }
  }

  await user.save();

  // Yangilangan to'liq ma'lumotni manzil bilan qayta o'qib olamiz
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [{ model: Address, as: 'address' }]
  });

  return ApiResponse.send(res, "Profil ma'lumotlari muvaffaqiyatli yangilandi! 📝", updatedUser);
};

// 3. Parolni yangilash
exports.updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { old_password, new_password } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("Foydalanuvchi topilmadi.", 404);
  }

  const isMatch = await bcrypt.compare(old_password, user.password);
  if (!isMatch) {
    throw new AppError("Eski parol noto'g'ri kiritildi!", 400);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(new_password, salt);
  await user.save();

  return ApiResponse.send(res, "Parolingiz muvaffaqiyatli o'zgartirildi! 🔒");
};

// 4. Akkauntni o'chirish (DELETE)
exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("O'chirish uchun foydalanuvchi topilmadi.", 404);
  }

  // Foydalanuvchi o'chganda uning savati, manzillari va boshqa bog'liq narsalari CASCADE orqali o'chib ketadi
  await user.destroy();

  return ApiResponse.send(res, "Sizning akkauntingiz muvaffaqiyatli o'chirildi! 🗑️", null);
};