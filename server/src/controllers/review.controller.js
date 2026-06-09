const Review = require('../models/review');
const User = require('../models/user');

// 1. Mahsulotga sharh yozish (Faqat ro'yxatdan o'tganlar uchun)
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, comment } = req.body;

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

// 2. Biror mahsulotning barcha sharhlarini olish (Hammaga ochiq)
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { product_id: productId },
      // Sharh egasining ismi chiqishi uchun User modelini ulaymiz
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};