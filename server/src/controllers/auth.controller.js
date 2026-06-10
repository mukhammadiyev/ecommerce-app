const User = require('../models/user'); // Kichik harfga to'g'rilandi
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// FOYDALANUVCHINI RO'YXATDAN O'TKAZISH
// ==========================================
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    
    if (!first_name || !email || !password) {
      return res.status(400).json({ success: false, message: "Majburiy maydonlarni to'ldiring!" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Bu email bilan allaqachon ro'yxatdan o'tilgan!" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = await User.create({ 
      first_name, 
      last_name, 
      email, 
      password: hashedPassword,
      role: 'user'
    });
    
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      message: "Foydalanuvchi muvaffaqiyatli yaratildi! 🎉", 
      data: userResponse 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi", error: error.message });
  }
};

// ==========================================
// TIZIMGA KIRISH (LOGIN)
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email va parolni kiriting!" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(444).json({ success: false, message: "Bunday emailga ega foydalanuvchi topilmadi!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Parol noto'g'ri!" });
    }

    // JWT_SECRET uchun zaxira kalit qo'yildi (crashni oldini olish uchun)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'maxfiy_kalit_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({ 
      success: true, 
      message: "Tizimga muvaffaqiyatli kirdingiz! 🔓", 
      token, 
      data: userResponse 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi", error: error.message });
  }
};