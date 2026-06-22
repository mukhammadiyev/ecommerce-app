const { sequelize } = require('../config/database');
const { Cart, CartItem, Product, Order, OrderItem, User, Coupon, CouponUsage } = require('../models/associations'); 
const emailService = require('../services/email.service');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// ========================================================
// 1. BUYURTMA YARATISH (PARALLEL SO'ROVDAN ABSOLYUT HIMOYA)
// ========================================================
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction({
    isolationLevel: 'SERIALIZABLE'
  });
  
  const userId = Number(req.user.id);
  const { shipping_address, phone_number, coupon_code } = req.body; 

  try {
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{ 
        model: CartItem, 
        as: 'cart_items', 
        include: [{ model: Product, as: 'product' }] 
      }],
      transaction
    });

    if (!cart || !cart.cart_items || cart.cart_items.length === 0) { 
      throw new AppError("Savatchangiz bo'sh! Buyurtma berib bo'lmaydi.", 400);
    }

    let subtotal = 0;
    for (const item of cart.cart_items) { 
      if (!item.product) {
        throw new AppError("Savatdagi mahsulot tizimda topilmadi!", 400);
      }
      
      if (item.product.stock < item.quantity) {
        throw new AppError(`Kechirasiz, "${item.product.name}" mahsulotidan omborda yetarli emas. Qoldiq: ${item.product.stock} ta`, 400);
      }
      subtotal += parseFloat(item.product.price) * item.quantity;
    }

    let discountAmount = 0;
    let coupon = null;

    if (coupon_code) {
      coupon = await Coupon.findOne({
        where: { code: coupon_code.trim().toUpperCase() },
        transaction,
        lock: transaction.LOCK.UPDATE 
      });

      if (!coupon) {
        throw new AppError("Bunday kupon topilmadi!", 404);
      }

      if (coupon.status !== 'Active' || new Date(coupon.expiry) < new Date()) {
        throw new AppError("Kupon muddati tugagan yoki faol emas!", 400);
      }

      const alreadyUsed = await CouponUsage.findOne({
        where: { coupon_id: coupon.id, user_id: userId },
        transaction
      });

      if (alreadyUsed) {
        throw new AppError("Siz bu kupondan oldin foydalangansiz!", 400);
      }

      if (coupon.type === 'percentage') {
        discountAmount = Math.round(subtotal * (coupon.value / 100));
      } else if (coupon.type === 'fixed') {
        discountAmount = parseFloat(coupon.value);
      }

      await CouponUsage.create({
        coupon_id: coupon.id,
        user_id: userId
      }, { transaction });
    }

    const shippingPrice = 100; 
    const final_total_price = Math.max(0, subtotal + shippingPrice - discountAmount);

    const order = await Order.create({
      user_id: userId,
      total_price: final_total_price,
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
      console.log("Email tizimida xatolik:", emailErr.message);
    }

    return ApiResponse.created(res, "Buyurtmangiz muvaffaqiyatli rasmiylashtirildi! 🎉", {
      order_id: order.id,
      total_price: final_total_price
    });

  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: "Siz bu kupondan oldin foydalangansiz!"
      });
    }
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Tizimda kutilmagan xatolik yuz berdi"
    });
  }
};

// ========================================================
// 2. FOYDALANUVCHI O'Z BUYURTMALARI TARIXINI OLISH
// ========================================================
exports.getMyOrders = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// 3. ADMIN BARCHA BUYURTMALARNI KO'RISHI (TO'G'RILANDI)
// ========================================================
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { 
          model: OrderItem, 
          as: 'order_items', 
          include: [{ model: Product, as: 'product' }] 
        },
        // 🔥 MANA BU YERGA USER MODELINI QO'SHDIK:
        {
          model: User,
          as: 'user', // Associations faylingizda qanday nomlangan bo'lsa (masalan: 'user')
          attributes: ['id', 'name', 'email'] // Bizga faqat ismi va emaili kerak
        }
      ], 
      order: [['createdAt', 'DESC']]
    });
    return ApiResponse.send(res, "Barcha buyurtmalar ro'yxati (Admin)", orders);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// 4. ADMIN BUYURTMA STATUSINI O'ZGARTIRISHI
// ========================================================
exports.updateOrderStatus = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ========================================================
// 5. FOYDALANUVCHI O'Z BUYURTMASINI BEKOR QILISHI
// ========================================================
exports.cancelMyOrder = async (req, res) => {
  try {
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
      throw new AppError("Bu buyurtmani endi bekor qilib bo'lmaydi! 🚚", 400);
    }

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
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};