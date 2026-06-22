const { User, Address, sequelize } = require('../models/associations'); 
const bcrypt = require('bcryptjs');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Profil ma'lumotlarini olish
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Address, as: 'address' } 
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
  const { name, last_name, phone_number, shipping_address } = req.body;

  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new AppError("Foydalanuvchi topilmadi.", 404);
    }

    user.name = name !== undefined ? name : user.name;
    user.last_name = last_name !== undefined ? last_name : user.last_name; 
    user.phone_number = phone_number !== undefined ? phone_number : user.phone_number;

    if (shipping_address !== undefined) {
      let addressRecord = await Address.findOne({ where: { user_id: userId }, transaction: t });
      if (addressRecord) {
        addressRecord.address_line = shipping_address; 
        await addressRecord.save({ transaction: t });
      } else {
        await Address.create({ user_id: userId, address_line: shipping_address }, { transaction: t });
      }
    }

    await user.save({ transaction: t });
    await t.commit();

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{ model: Address, as: 'address' }]
    });

    return ApiResponse.send(res, "Profil ma'lumotlari muvaffaqiyatli yangilandi! 📝", updatedUser);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// 3. Parolni yangilash
exports.updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { old_password, new_password } = req.body;

  if (old_password === new_password) {
    throw new AppError("Yangi parol eski paroldan farqli bo'lishi kerak!", 400);
  }

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

// 4. Akkauntni o'chirish
exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("O'chirish uchun foydalanuvchi topilmadi.", 404);
  }

  await user.destroy();
  return ApiResponse.send(res, "Sizning akkauntingiz muvaffaqiyatli o'chirildi! 🗑️", null);
};