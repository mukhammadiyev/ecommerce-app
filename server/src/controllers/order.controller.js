const { sequelize } = require('../config/database');
const { Cart, CartItem, Product, Order, OrderItem, User } = require('../models/associations'); 
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
    include: [{ 
      model: CartItem, 
      as: 'cart_items', 
      include: [{ model: Product, as: 'product' }] 
    }] 
  });

  if (!cart || !cart.cart_items || cart.cart_items.length === 0) { 
    await transaction.rollback();
    throw new AppError("Savatchangiz bo'sh! Buyurtma berib bo'lmaydi.", 400);
  }

  let total_price = 0;
  for (const item of cart.cart_items) { 
    if (!item.product) {
      await transaction.rollback();
      throw new AppError("Savatdagi mahsulot tizimda topilmadi!", 400);
    }
    
    if (item.product.stock < item.quantity) {
      await transaction.rollback();
      throw new AppError(`Kechirasiz, "${item.product.name}" mahsulotidan omborda yetarli emas. Qoldiq: ${item.product.stock} ta`, 400);
    }
    total_price += parseFloat(item.product.price) * item.quantity;
  }

  const order = await Order.create({
    user_id: userId,
    total_price,
    shipping_address,
    phone_number, 
    status: 'pending'
  }, { transaction });

  for (const item of cart.cart_items) { 
    await OrderItem.create({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price
    }, { transaction });

    // Ombordagi qoldiqni kamaytiramiz (Muvaffaqiyatli ishlaydi)
    await item.product.decrement('stock', { by: item.quantity, transaction });
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
      as: 'order_items', 
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
    }],
    order: [['createdAt', 'DESC']]
  });

  return ApiResponse.send(res, "Buyurtmalar tarixi yuklandi", orders);
};

// 3. Admin barcha buyurtmalarni ko'rishi
exports.getAllOrdersForAdmin = async (req, res) => {
  const orders = await Order.findAll({
    include: [{ 
      model: OrderItem, 
      as: 'order_items', 
      include: [{ model: Product, as: 'product' }] 
    }], 
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

  const order = await Order.findByPk(id, {
    include: [{ model: OrderItem, as: 'order_items', include: [{ model: Product, as: 'product' }] }]
  });
  
  if (!order) {
    throw new AppError("Buyurtma topilmadi!", 404);
  }

  // 🔥 Yangilik: Agar admin buyurtmani bekor qilsa, mahsulotlarni omborga qaytaramiz
  if (status === 'cancelled' && order.status !== 'cancelled') {
    const transaction = await sequelize.transaction();
    try {
      for (const item of order.order_items) {
        if (item.product) {
          await item.product.increment('stock', { by: item.quantity, transaction });
        }
      }
      order.status = status;
      await order.save({ transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } else {
    order.status = status;
    await order.save();
  }

  return ApiResponse.send(res, `Buyurtma statusi "${status}" ga o'zgartirildi!`, order);
};

// 5. Foydalanuvchi o'z buyurtmasini bekor qilishi (PUT)
exports.cancelMyOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({ 
    where: { id, user_id: userId },
    include: [{ model: OrderItem, as: 'order_items', include: [{ model: Product, as: 'product' }] }]
  });

  if (!order) {
    throw new AppError("Buyurtma topilmadi!", 404);
  }

  if (order.status === 'cancelled') {
    throw new AppError("Bu buyurtma allaqachon bekor qilingan!", 400);
  }

  if (order.status !== 'pending' && order.status !== 'processing') {
    throw new AppError("Bu buyurtmani endi bekor qilib bo'lmaydi, chunki u yo'lga chiqqan! 🚚", 400);
  }

  // 🔥 Yangilik: Foydalanuvchi buyurtmani bekor qilsa, narsalar omborga qaytadi
  const transaction = await sequelize.transaction();
  try {
    for (const item of order.order_items) {
      if (item.product) {
        await item.product.increment('stock', { by: item.quantity, transaction });
      }
    }
    order.status = 'cancelled';
    await order.save({ transaction });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return ApiResponse.send(res, "Buyurtmangiz muvaffaqiyatli bekor qilindi! ❌", order);
};