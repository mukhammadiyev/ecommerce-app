const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/response'); // 🔥 Standart javob klassimiz ulandi

// ==========================================
// FOYDALANUVCHINI RO'YXATDAN O'TKAZISH
// ==========================================
exports.register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError("Bu email bilan allaqachon ro'yxatdan o'tilgan!", 400);
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

  // 🔥 Eski res.status(201).json(...) o'rniga qisqa va standart format
  return ApiResponse.created(res, "Foydalanuvchi muvaffaqiyatli yaratildi! 🎉", userResponse);
};

// ==========================================
// TIZIMGA KIRISH (LOGIN)
// ==========================================
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ where: { email } });
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

  // 🔥 Eski res.status(200).json(...) o'rniga token va user ma'lumotlarini bitta standartda qaytaramiz
  return ApiResponse.send(res, "Tizimga muvaffaqiyatli kirdingiz! 🔓", { 
    token, 
    user: userResponse 
  });
};