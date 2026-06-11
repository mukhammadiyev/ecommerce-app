const Payment = require('../models/payment'); // To'lov modeli nomi loyihangizga qarab o'zgarishi mumkin
const Order = require('../models/order');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. To'lovni amalga oshirish (Mavjud funksiyangiz)
exports.processPayment = async (req, res) => {
  const { order_id, payment_method, amount } = req.body;

  const order = await Order.findByPk(order_id);
  if (!order) {
    throw new AppError("To'lov qilinayotgan buyurtma topilmadi!", 404);
  }

  // To'lovni bazada yaratish (Dastlab 'pending' yoki 'completed' bo'lishi mumkin)
  const payment = await Payment.create({
    order_id,
    user_id: req.user.id,
    payment_method, // 'click', 'payme', 'cash', 'card'
    amount,
    status: 'completed' // To'lov tizimi muvaffaqiyatli o'tdi deb hisoblaymiz
  });

  // To'lov muvaffaqiyatli bo'lsa, tegishli buyurtma statusini ham yangilash mumkin
  // order.status = 'processing'; 
  // await order.save();

  return ApiResponse.send(res, "To'lov muvaffaqiyatli qabul qilindi! 💸", payment, 201);
};

// 2. Admin barcha to'lovlar tarixini ko'rishi (GET) 🆕
exports.getAllPaymentsForAdmin = async (req, res) => {
  const payments = await Payment.findAll({
    order: [['createdAt', 'DESC']]
  });
  return ApiResponse.send(res, "Barcha to'lovlar ro'yxati (Admin)", payments);
};

// 3. Admin to'lov statusini o'zgartirishi (PUT) 🆕
// Masalan: Naqd pulda to'lanadigan buyurtma kelganda yoki qaytarib berilganda (refund)
exports.updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'pending', 'completed', 'failed', 'refunded'

  const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
  if (!validStatuses.includes(status)) {
    throw new AppError("Noto'g'ri to'lov statusi yuborildi!", 400);
  }

  const payment = await Payment.findByPk(id);
  if (!payment) {
    throw new AppError("To'lov ma'lumoti topilmadi!", 404);
  }

  payment.status = status;
  await payment.save();

  return ApiResponse.send(res, `To'lov statusi "${status}" ga yangilandi! 🔄`, payment);
};