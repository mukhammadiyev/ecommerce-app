const User = require('../models/user');
const bcrypt = require('bcryptjs'); // Loyihangizdagi boshqa joylarda bcryptjs bo'lgani uchun moslashtirildi

// ==========================================
// 1. PROFIL MA'LUMOTLARINI OLISH
// ==========================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Paroldan tashqari barcha ma'lumotlarni bazadan olamiz
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi." });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// 2. PROFIL MA'LUMOTLARINI YANGILASH
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone_number, shipping_address } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi." });
    }

    // Faqat yuborilgan yoki o'zgargan maydonlarni yangilaymiz
    user.first_name = first_name !== undefined ? first_name : user.first_name;
    user.last_name = last_name !== undefined ? last_name : user.last_name;
    user.phone_number = phone_number !== undefined ? phone_number : user.phone_number;
    user.shipping_address = shipping_address !== undefined ? shipping_address : user.shipping_address;

    await user.save();

    // Yangilangan ma'lumotni parolsiz qaytaramiz
    const updatedUser = user.toJSON();
    delete updatedUser.password;

    res.status(200).json({ 
      success: true, 
      message: "Profil ma'lumotlari muvaffaqiyatli yangilandi! 📝", 
      data: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// 3. PAROLNI O'ZGARTIRISH
// ==========================================
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: "Eski va yangi parollar kiritilishi shart!" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi." });
    }

    // Eski parol to'g'riligini tekshiramiz
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Eski parol noto'g'ri kiritildi!" });
    }

    // Yangi parolni shifrlab saqlaymiz
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    
    await user.save();

    res.status(200).json({ success: true, message: "Parolingiz muvaffaqiyatli o'zgartirildi! 🔒" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};