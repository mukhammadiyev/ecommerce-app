const Review = require('../models/Review');
const User = require('../models/User');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Yangi sharh qo'shish
exports.addReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;

  const review = await Review.create({
    user_id: req.user.id,
    product_id,
    rating,
    comment
  });

  return ApiResponse.send(res, "Sharhingiz qabul qilindi", review, 201);
};

// 2. Mahsulotga tegishli barcha sharhlarni olish
exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.findAll({
    where: { product_id: productId },
    include: [{ model: User, attributes: ['first_name', 'last_name'] }]
  });

  return ApiResponse.send(res, "Mahsulot sharhlari yuklandi", reviews);
};

// 3. Sharhni tahrirlash (PUT) 🆕
exports.updateReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { id } = req.params;

  const review = await Review.findByPk(id);
  if (!review) {
    throw new AppError("Tahrirlash uchun sharh topilmadi", 404);
  }

  // Faqat sharh egasi uni tahrirlay olishi shart 🔒
  if (review.user_id !== req.user.id) {
    throw new AppError("Siz faqat o'zingiz yozgan sharhni tahrirlashingiz mumkin", 403);
  }

  review.rating = rating !== undefined ? rating : review.rating;
  review.comment = comment !== undefined ? comment : review.comment;

  await review.save();

  return ApiResponse.send(res, "Sharhingiz muvaffaqiyatli yangilandi! 🔄", review);
};

// 4. Sharhni o'chirish (DELETE) 🆕
exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByPk(id);
  if (!review) {
    throw new AppError("O'chirish uchun sharh topilmadi", 404);
  }

  // Sharhni o'zi yozgan odam YOKI admin o'chira olishi mumkin 🔒
  if (review.user_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError("Bu sharhni o'chirish uchun sizda huquq yo'q", 403);
  }

  await review.destroy();

  return ApiResponse.send(res, "Sharh muvaffaqiyatli o'chirildi! 🗑️");
};