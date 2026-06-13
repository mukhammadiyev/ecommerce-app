const { User, Cart } = require('../models/associations'); // ⚙️ Markaziy fayldan import qilamiz (Cart ham qo'shildi)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/response');

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

  // 🆕 Yangi foydalanuvchi uchun avtomatik ravishda bo'sh savat yaratamiz
  await Cart.create({ user_id: newUser.id });
  
  const userResponse = newUser.toJSON();
  delete userResponse.password;

  return ApiResponse.created(res, "Foydalanuvchi muvaffaqiyatli yaratildi va savat ajratildi! 🎉", userResponse);
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

  return ApiResponse.send(res, "Tizimga muvaffaqiyatli kirdingiz! 🔓", { 
    token, 
    user: userResponse 
  });
};