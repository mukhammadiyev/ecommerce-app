const Review = require('../models/Review');
const User = require('../models/User');

// ==========================================
// 1. MAHSULOTGA SHARH YOZISH (Faqat ro'yxatdan o'tganlar uchun)
// ==========================================
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: "Mahsulot ID va reyting (rating) ko'rsatilishi shart!" 
      });
    }

    // Bitta foydalanuvchi bitta mahsulotga faqat 1 marta sharh yozishi mumkin
    const alreadyReviewed = await Review.findOne({
      where: { user_id: userId, product_id }
    });

    if (alreadyReviewed) {
      return res.status(400).json({ 
        success: false, 
        message: "Siz bu mahsulotga allaqachon sharh qoldirgan ekansiz!" 
      });
    }

    const newReview = await Review.create({
      user_id: userId,
      product_id,
      rating,
      comment
    });

    res.status(201).json({ 
      success: true, 
      message: "Sharhingiz muvaffaqiyatli qo'shildi! ⭐", 
      data: newReview 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// 2. BIROR MAHSULOTNING BARCHA SHARHLARINI OLISH (Hammaga ochiq)
// ==========================================
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { product_id: productId },
      // 👈 Modelda ko'rsatilgan 'User' taxallusi (as) bu yerga ham qo'shildi
      include: [{ 
        model: User, 
        as: 'User',
        attributes: ['id', 'first_name', 'last_name'] 
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};