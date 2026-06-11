const { sequelize } = require('../config/database');
const Cart = require('../models/cart');      
const CartItem = require('../models/cartitem'); 
const Product = require('../models/product');
const Order = require('../models/order');
const OrderItem = require('../models/orderitem');
const User = require('../models/user');
const emailService = require('../services/email.service');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Buyurtma yaratish (Transaction bilan)
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  const userId = req.user.id;
  const { shipping_address, phone_number } = req.body; 

  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: [{ model: CartItem, as: 'CartItems', include: [Product] }]
  });

  if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
    await transaction.rollback();
    throw new AppError("Savatchangiz bo'sh! Buyurtma berib bo'lmaydi.", 400);
  }

  let total_price = 0;
  for (const item of cart.CartItems) { 
    if (!item.Product) {
      await transaction.rollback();
      throw new AppError("Savatdagi mahsulot tizimda topilmadi!", 400);
    }
    
    if (item.Product.stock < item.quantity) {
      await transaction.rollback();
      throw new AppError(`Kechirasiz, "${item.Product.name}" mahsulotidan omborda yetarli emas. Qoldiq: ${item.Product.stock} ta`, 400);
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

  try {
    const user = await User.findByPk(userId);
    if (user && emailService && typeof emailService.sendOrderInvoiceEmail === 'function') {
      await emailService.sendOrderInvoiceEmail(user.email, order);
    }
  } catch (emailErr) {
    console.log("Email tizimida xatolik yuz berdi:", emailErr.message);
  }

  return ApiResponse.created(res, "Buyurtmangiz muvaffaqiyatli rasmiylashtirildi! 🎉", {
    order_id: order.id,
    total_price
  });
};

// 2. Foydalanuvchi o'z buyurtmalari tarixini olish
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;
  const orders = await Order.findAll({
    where: { user_id: userId },
    include: [{
      model: OrderItem,
      include: [{ model: Product, attributes: ['id', 'name', 'price'] }]
    }],
    order: [['createdAt', 'DESC']]
  });

  return ApiResponse.send(res, "Buyurtmalar tarixi yuklandi", orders);
};

// 3. Admin barcha buyurtmalarni ko'rishi
exports.getAllOrdersForAdmin = async (req, res) => {
  const orders = await Order.findAll({
    include: [{ model: OrderItem, include: [Product] }],
    order: [['createdAt', 'DESC']]
  });
  return ApiResponse.send(res, "Barcha buyurtmalar ro'yxati (Admin)", orders);
};

// 4. Admin buyurtma statusini o'zgartirishi (PUT)
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError("Noto'g'ri status yuborildi!", 400);
  }

  const order = await Order.findByPk(id);
  if (!order) {
    throw new AppError("Buyurtma topilmadi!", 404);
  }

  order.status = status;
  await order.save();

  return ApiResponse.send(res, `Buyurtma statusi "${status}" ga o'zgartirildi!`, order);
};

// 5. Foydalanuvchi o'z buyurtmasini bekor qilishi (PUT) 🆕
exports.cancelMyOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({ where: { id, user_id: userId } });
  if (!order) {
    throw new AppError("Buyurtma topilmadi!", 404);
  }

  // Agar buyurtma allaqachon yo'lga chiqqan yoki yetkazilgan bo'lsa, uni bekor qilib bo'lmaydi
  if (order.status !== 'pending' && order.status !== 'processing') {
    throw new AppError("Bu buyurtmani endi bekor qilib bo'lmaydi, chunki u yo'lga chiqqan! 🚚", 400);
  }

  order.status = 'cancelled';
  await order.save();

  return ApiResponse.send(res, "Buyurtmangiz muvaffaqiyatli bekor qilindi! ❌", order);
};