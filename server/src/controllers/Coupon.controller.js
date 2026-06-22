// Tepasiga CouponUsage ni qo'shing
const { Coupon, CouponUsage } = require('../models/associations');
const { Op } = require('sequelize');

// 1. Hamma kuponlarni olish (Adminlar uchun)
exports.getAllCoupons = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    await Coupon.update(
      { status: 'Expired' },
      {
        where: {
          expiry: { [Op.lt]: today },
          status: 'Active'
        }
      }
    );

    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// 2. Yangi kupon yaratish (Adminlar uchun)
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, type, value, expiry } = req.body;

    if (!code || !value || !expiry) {
      return res.status(400).json({ success: false, message: "Barcha maydonlarni to'ldiring!" });
    }

    const formattedCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ where: { code: formattedCode } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Bunday kupon kodi allaqachon mavjud!" });
    }

    const newCoupon = await Coupon.create({ 
      code: formattedCode, 
      type, 
      value, 
      expiry
    });
    
    res.status(201).json({ success: true, data: newCoupon });
  } catch (error) {
    next(error);
  }
};

// 3. Kuponni o'chirish (Adminlar uchun)
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Kupon topilmadi!" });
    }

    res.status(200).json({ success: true, message: "Kupon muvaffaqiyatli o'chirildi." });
  } catch (error) {
    next(error);
  }
};

// 🔥 4. YANGI FUNKSIYA: Oddiy foydalanuvchi savatchada kuponni tekshirishi uchun
exports.checkCoupon = async (req, res, next) => {
  try {
    const { code } = req.params;
    const userId = req.user.id; // authMiddleware dan keladi

    const coupon = await Coupon.findOne({
      where: { code: code.trim().toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Bunday kupon topilmadi!" });
    }

    if (coupon.status !== 'Active' || new Date(coupon.expiry) < new Date()) {
      return res.status(400).json({ success: false, message: "Kupon muddati tugagan yoki faol emas!" });
    }

    // Yangi unikal jadval orqali foydalanuvchi bu kuponni ishlatgan yoki ishlatmaganini tekshiramiz
    const alreadyUsed = await CouponUsage.findOne({
      where: { coupon_id: coupon.id, user_id: userId }
    });

    if (alreadyUsed) {
      return res.status(400).json({ success: false, message: "Siz bu kupondan foydalangansiz! (Faqat 1 marta)" });
    }

    // Agar hammasi joyida bo'lsa, kupon ma'lumotlarini qaytaramiz
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};