// ⚙️ Markaziy importga Card modeli muvaffaqiyatli ulandi
const { Payment, Order, User, Card } = require('../models/associations'); 
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// ==========================================
// 💳 1. FOYDALANUVCHI KARTALARINI BOSHQARISH
// ==========================================

// A. Foydalanuvchining hamma kartalarini olish (GET)
exports.getUserCards = async (req, res, next) => {
  try {
    const cards = await Card.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['createdAt', 'DESC']] 
    });

    // Frontend formatiga moslash (camelCase)
    const formattedCards = cards.map(c => ({
      id: c.id,
      number: c.card_number,
      name: c.card_name,
      cvc: c.cvc,
      expiry: c.expiry_date,
      isDefault: c.is_default
    }));

    return ApiResponse.send(res, "Foydalanuvchi kartalari ro'yxati", formattedCards);
  } catch (error) {
    console.error("getUserCards xatoligi:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// B. Yangi karta qo'shish (POST)
exports.addUserCard = async (req, res, next) => {
  try {
    const { number, name, expiry, cvc } = req.body;
    const userId = req.user.id;

    if (!number || !name || !expiry || !cvc) {
      return res.status(400).json({ success: false, message: "Barcha karta ma'lumotlarini to'ldirish majburiy!" });
    }

    const cardCount = await Card.count({ where: { user_id: userId } });
    const isFirstCard = cardCount === 0;

    const newCard = await Card.create({
      user_id: userId,
      card_number: number,
      card_name: name,
      expiry_date: expiry,
      cvc: cvc,
      is_default: isFirstCard
    });

    return ApiResponse.created(res, "Yangi karta muvaffaqiyatli saqlandi! 💳", {
      id: newCard.id,
      number: newCard.card_number,
      name: newCard.card_name,
      cvc: newCard.cvc,
      expiry: newCard.expiry_date,
      isDefault: newCard.is_default
    });
  } catch (error) {
    console.error("addUserCard xatoligi:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// C. Kartani asosiy (Default) qilib sozlash (PUT)
exports.setDefaultCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;

    // Foydalanuvchiga tegishli karta borligini tekshiramiz
    const targetCard = await Card.findOne({ where: { id: cardId, user_id: userId } });
    if (!targetCard) {
      return res.status(404).json({ success: false, message: "Karta topilmadi yoki sizga tegishli emas!" });
    }

    // Foydalanuvchining barcha kartalarini `is_default = false` holatiga keltiramiz
    await Card.update({ is_default: false }, { where: { user_id: userId } });

    // Tanlangan kartani `is_default = true` qilamiz
    targetCard.is_default = true;
    await targetCard.save();

    return ApiResponse.send(res, "Karta asosiy to'lov usuli sifatida belgilandi! 🌟", {
      id: targetCard.id,
      isDefault: targetCard.is_default
    });
  } catch (error) {
    console.error("setDefaultCard xatoligi:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// D. Kartani o'chirish (DELETE)
exports.deleteUserCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;

    const card = await Card.findOne({ where: { id: cardId, user_id: userId } });
    if (!card) {
      return res.status(404).json({ success: false, message: "O'chirilayotgan karta topilmadi!" });
    }

    const wasDefault = card.is_default;

    // Kartani o'chirish
    await card.destroy();

    // Agar o'chirilgan karta default (asosiy) bo'lgan bo'lsa va yana boshqa kartalar qolgan bo'lsa,
    // qolgan kartalardan birinchisini avtomatik default qilib qo'yamiz
    if (wasDefault) {
      const nextCard = await Card.findOne({ where: { user_id: userId } });
      if (nextCard) {
        nextCard.is_default = true;
        await nextCard.save();
      }
    }

    return ApiResponse.send(res, "Karta muvaffaqiyatli o'chirildi! 🗑️");
  } catch (error) {
    console.error("deleteUserCard xatoligi:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 🛍️ 2. MAVJUD TO'LOV FUNKSIYALARI
// ==========================================

// Toʻlovni amalga oshirish
exports.processPayment = async (req, res, next) => {
  try {
    const { order_id, payment_method, card_number, amount } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({ where: { id: order_id, user_id: userId } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Toʻlov qilinayotgan buyurtma topilmadi yoki sizga tegishli emas!" });
    }

    let card_mask = null;
    if (card_number) {
      card_mask = `${card_number.slice(0, 4)}****${card_number.slice(-4)}`;
    }

    const payment = await Payment.create({
      order_id,
      user_id: userId,
      payment_method, 
      card_mask,
      amount,
      status: 'completed'
    });

    order.status = 'processing'; 
    await order.save();

    return ApiResponse.created(res, "Toʻlov muvaffaqiyatli qabul qilindi! 💸", payment);
  } catch (error) {
    console.error("processPayment xatoligi:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin barcha toʻlovlar tarixini ko'rishi (GET)
exports.getAllPaymentsForAdmin = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['first_name', 'last_name', 'email'] 
      }],
      order: [['createdAt', 'DESC']]
    });
    return ApiResponse.send(res, "Barcha toʻlovlar roʻyxati (Admin)", payments);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin toʻlov statusini oʻzgartirishi (PUT)
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Notoʻgʻri toʻlov statusi yuborildi!" });
    }

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Toʻlov maʼlumoti topilmadi!" });
    }

    payment.status = status;
    await payment.save();

    return ApiResponse.send(res, `Toʻlov statusi "${status}" ga yangilandi! 🔄`, payment);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};