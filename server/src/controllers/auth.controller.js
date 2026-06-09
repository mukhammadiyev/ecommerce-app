const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');

// ==========================================
// FOYDALANUVCHINI RO'YXATDAN O'TKAZISH
// ==========================================
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    
    // Email mavjudligini tekshirish
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Bu email bilan allaqachon ro'yxatdan o'tilgan!" 
      });
    }

    // Parolni xavfsiz heshlash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Yangi foydalanuvchini yaratish
    const newUser = await User.create({ 
      first_name, 
      last_name, 
      email, 
      password: hashedPassword 
    });
    
    // Parol xavfsizligi uchun javobdan parolni olib tashlaymiz
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    // 📧 Orqa fonda foydalanuvchiga xush kelibsiz xatini yuboramiz
    emailService.sendWelcomeEmail(newUser.email, newUser.first_name)
      .catch(err => console.log("Welcome Email yuborishda xatolik:", err.message));

    res.status(201).json({ 
      success: true, 
      message: "Foydalanuvchi muvaffaqiyatli yaratildi! 🎉", 
      data: userResponse 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Serverda xatolik yuz berdi", 
      error: error.message 
    });
  }
};

// ==========================================
// TIZIMGA KIRISH (LOGIN)
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Foydalanuvchini email orqali qidirish
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(444).json({ 
        success: false, 
        message: "Bunday emailga ega foydalanuvchi topilmadi!" 
      });
    }

    // Parolni tekshirish
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Parol noto'g'ri!" 
      });
    }

    // JWT token yaratish (ichiga id va role joylanadi)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
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
    res.status(500).json({ 
      success: false, 
      message: "Serverda xatolik yuz berdi", 
      error: error.message 
    });
  }
};