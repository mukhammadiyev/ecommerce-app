const Payment = require('../models/payment');
const Order = require('../models/order');

// ==========================================
// TO'LOVNI AMALGA OSHIRISH (SIMULYATSIYA)
// ==========================================
exports.processPayment = async (req, res) => {
  try {
    const { order_id, card_name, card_number, cvv, valid_through } = req.body;

    if (!order_id || !card_name || !card_number || !cvv || !valid_through) {
      return res.status(400).json({ success: false, message: "Karta ma'lumotlari to'liq kiritilmadi!" });
    }

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Buyurtma topilmadi!" });
    }

    const payment = await Payment.create({
      order_id,
      card_name,
      card_number: card_number.replace(/\s?/g, '').slice(-4), 
      amount: order.total_price,
      status: 'completed' 
    });

    order.status = 'processing';
    await order.save();

    res.status(200).json({
      success: true,
      message: "To'lov muvaffaqiyatli amalga oshirildi! 💳",
      payment_data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};