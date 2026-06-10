const { sequelize } = require('../config/database');
const Cart = require('../models/cart');      
const CartItem = require('../models/cartitem'); 
const Product = require('../models/product');
const Order = require('../models/order');
const OrderItem = require('../models/orderitem');
const User = require('../models/user');
const emailService = require('../services/email.service');

// ==========================================
// YANGI BUYURTMA YARATISH (CHECKOUT)
// ==========================================
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  let isFinished = false; 

  try {
    const userId = req.user.id;
    const { shipping_address, phone_number } = req.body; 

    if (!shipping_address || !phone_number) {
      await transaction.rollback();
      isFinished = true;
      return res.status(400).json({ 
        success: false, 
        message: "Yetkazib berish manzili va telefon raqami kiritilishi shart!" 
      });
    }

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{ 
        model: CartItem, 
        as: 'CartItems', 
        include: [Product] 
      }]
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await transaction.rollback();
      isFinished = true;
      return res.status(400).json({ success: false, message: "Savatchangiz bo'sh! Buyurtma berib bo'lmaydi." });
    }

    let total_price = 0;
    for (const item of cart.CartItems) { 
      if (!item.Product) {
        await transaction.rollback();
        isFinished = true;
        return res.status(400).json({ success: false, message: "Savatdagi mahsulot tizimda topilmadi!" });
      }
      
      if (item.Product.stock < item.quantity) {
        await transaction.rollback();
        isFinished = true;
        return res.status(400).json({
          success: false,
          message: `Kechirasiz, "${item.Product.name}" mahsulotidan omborda yetarli emas. Qoldiq: ${item.Product.stock} ta`
        });
      }
      total_price += parseFloat(item.Product.price) * item.quantity;
    }

    const order = await Order.create({
      user_id: userId,
      total_price,
      shipping_address,
      phone_number, 
      status: 'pending'
    }, { transaction });

    for (const item of cart.CartItems) { 
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.Product.price
      }, { transaction });

      await item.Product.decrement('stock', { by: item.quantity, transaction });
    }

    await CartItem.destroy({ where: { cart_id: cart.id }, transaction });

    await transaction.commit();
    isFinished = true; 

    // Email yuborish
    try {
      const user = await User.findByPk(userId);
      if (user && emailService && typeof emailService.sendOrderInvoiceEmail === 'function') {
        await emailService.sendOrderInvoiceEmail(user.email, order);
      }
    } catch (emailErr) {
      console.log("Email yuborish tizimida xatolik (lekin buyurtma saqlandi):", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Buyurtmangiz muvaffaqiyatli rasmiylashtirildi! 🎉",
      order_id: order.id,
      total_price
    });

  } catch (error) {
    if (!isFinished) {
      await transaction.rollback();
    }
    return res.status(500).json({ success: false, message: "Buyurtma berishda xatolik yuz berdi", error: error.message });
  }
};

// ==========================================
// FOYDALANUVCHI BUYURTMALAR TARIXI
// ==========================================
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [{
        model: OrderItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Buyurtmalarni yuklashda xatolik", error: error.message });
  }
};

// ==========================================
// ADMIN: BARCHA BUYURTMALARNI KO'RISH
// ==========================================
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, include: [Product] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// ADMIN: BUYURTMA STATUSINI O'ZGARTIRISH
// ==========================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Noto'g'ri status yuborildi!" });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Buyurtma topilmadi!" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: `Buyurtma statusi "${status}" ga o'zgartirildi!`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Statusni yangilashda xatolik", error: error.message });
  }
};