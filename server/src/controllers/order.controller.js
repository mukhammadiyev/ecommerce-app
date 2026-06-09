const { sequelize } = require('../config/database');
const Cart = require('../models/cart');
const CartItem = require('../models/cartitem');
const Product = require('../models/product');
const Order = require('../models/order');
const OrderItem = require('../models/orderitem');
// 1. Kerakli model va email servisni chaqiramiz
const User = require('../models/user');
const emailService = require('../services/email.service');

exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { shipping_address } = req.body;

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{ model: CartItem, include: [Product] }]
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Savatchangiz bo'sh! Buyurtma berib bo'lmaydi." });
    }

    let total_price = 0;
    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        await transaction.rollback();
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

    // 2. Tranzaksiya muvaffaqiyatli tugagach, foydalanuvchiga chek yuboramiz
    const user = await User.findByPk(userId);
    if (user) {
      emailService.sendOrderInvoiceEmail(user.email, order)
        .catch(err => console.log("Invoice Email yuborishda xatolik:", err.message));
    }

    res.status(201).json({
      success: true,
      message: "Buyurtmangiz muvaffaqiyatli rasmiylashtirildi! 🎉",
      order_id: order.id,
      total_price
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: "Buyurtma berishda xatolik yuz berdi", error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [{
        model: OrderItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'image_url']
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Buyurtmalarni yuklashda xatolik", error: error.message });
  }
};

exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, include: [Product] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

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