const { User, Cart } = require('../models/associations'); // ⚙️ Markaziy fayldan import qilamiz (Cart ham qo'shildi)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/response');
const { Op } = require('sequelize'); // 🔥 Sequelize operatorini qidiruv uchun chaqiramiz

// ==========================================
// FOYDALANUVCHINI RO'YXATDAN O'TKAZISH
// ==========================================
exports.register = async (req, res, next) => {
  try {
    // 1. Request'dan faqat kerakli maydonlarni ajratib olamiz
    const { name, email, password } = req.body;

    // 2. Email band emasligini tekshiramiz
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Bu email manziliga ochilgan akkaunt allaqachon mavjud!" 
      });
    }

    // 3. Parolni shifrlaymiz
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Bazaga yangi foydalanuvchini faqat 'name' bilan saqlaymiz
    const newUser = await User.create({
      name, // <--- first_name va last_name o'rniga bitta 'name'
      email,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: "Ro'yxatdan muvaffaqiyatli o'tdingiz! 🎉",
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    next(error); // global error handlerga yuborish
  }
};

// ==========================================
// TIZIMGA KIRISH (LOGIN) - TO'G'RILANGAN VERSUYA
// ==========================================
exports.login = async (req, res) => {
  // 🔄 Frontenddan endi aniq 'email' va 'password' kelyapti
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new AppError("Email va parol kiritilishi shart!", 400);
  }

  // 🔍 Bazadan faqat kelayotgan 'email' ustuni bo'yicha qidiramiz
  const user = await User.findOne({ 
    where: { email: email } 
  });

  if (!user) {
    throw new AppError("Bunday emailga ega foydalanuvchi topilmadi!", 444);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Parol noto'g'ri!", 400);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'maxfiy_kalit_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );

  const userResponse = user.toJSON();
  delete userResponse.password;

  return ApiResponse.send(res, "Tizimga muvaffaqiyatli kirdingiz! 🔓", { 
    token, 
    user: userResponse 
  });
};