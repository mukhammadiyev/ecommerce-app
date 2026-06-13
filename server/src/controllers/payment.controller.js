const { Payment, Order, User } = require('../models/associations'); // ⚙️ Markaziy import
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Toʻlovni amalga oshirish
exports.processPayment = async (req, res) => {
  const { order_id, payment_method, card_number, amount } = req.body;
  const userId = req.user.id;

  const order = await Order.findOne({ where: { id: order_id, user_id: userId } });
  if (!order) {
    throw new AppError("Toʻlov qilinayotgan buyurtma topilmadi yoki sizga tegishli emas!", 404);
  }

  // Karta raqamini maskalash
  let card_mask = null;
  if (card_number) {
    card_mask = `${card_number.slice(0, 4)}****${card_number.slice(-4)}`;
  }

  // Toʻlovni bazada yaratish
  const payment = await Payment.create({
    order_id,
    user_id: userId,
    payment_method, 
    card_mask,
    amount,
    status: 'completed'
  });

  // Toʻlov muvaffaqiyatli boʻlgani uchun buyurtma statusini 'processing' (tayyorlanmoqda) ga oʻtkazamiz
  order.status = 'processing'; 
  await order.save();

  // ⚙️ ApiResponse.created standarti ishlatildi
  return ApiResponse.created(res, "Toʻlov muvaffaqiyatli qabul qilindi! 💸", payment);
};

// 2. Admin barcha toʻlovlar tarixini ko'rishi (GET)
exports.getAllPaymentsForAdmin = async (req, res) => {
  const payments = await Payment.findAll({
    include: [{ 
      model: User, 
      as: 'user', // ⚙️ associations.js dagi alias ulandi
      attributes: ['first_name', 'last_name', 'email'] 
    }],
    order: [['createdAt', 'DESC']]
  });
  return ApiResponse.send(res, "Barcha toʻlovlar roʻyxati (Admin)", payments);
};

// 3. Admin toʻlov statusini oʻzgartirishi (PUT)
exports.updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 

  const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
  if (!validStatuses.includes(status)) {
    throw new AppError("Notoʻgʻri toʻlov statusi yuborildi!", 400);
  }

  const payment = await Payment.findByPk(id);
  if (!payment) {
    throw new AppError("Toʻlov maʼlumoti topilmadi!", 404);
  }

  payment.status = status;
  await payment.save();

  return ApiResponse.send(res, `Toʻlov statusi "${status}" ga yangilandi! 🔄`, payment);
};