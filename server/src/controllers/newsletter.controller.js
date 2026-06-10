const { sequelize } = require('../config/database');
const Newsletter = sequelize.models.Newsletter || require('../models/Newsletter');

// 1. Yangi emailni obunachilar ro'yxatiga qo'shish (Footer qismidagi forma)
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email kiritilishi shart!" });
    }

    // Email oldin obuna bo'lganmi yoki yo'q tekshiramiz
    const existing = await Newsletter.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Siz allaqachon bu e-mail orqali obuna bo'lgansiz! 😊" 
      });
    }

    await Newsletter.create({ email });

    return res.status(201).json({
      success: true,
      message: "Yangiliklar va chegirmalarga muvaffaqiyatli obuna bo'ldingiz! 🎉"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Obuna bo'lishda xatolik yuz berdi",
      error: error.message
    });
  }
};

// 2. Admin uchun: Barcha obunachilar ro'yxatini olish
exports.getAllSubscribersForAdmin = async (req, res) => {
  try {
    const subscribers = await Newsletter.findAll({
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Ro'yxatni yuklashda xatolik",
      error: error.message
    });
  }
};