const { sequelize } = require('../config/database');
const { Cart, CartItem, Product, ProductImage } = require('../models/associations'); 
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// ========================================================
// 1. FOYDALANUVCHI SAVATINI OLISH (TOTAL PRICE BILAN)
// ========================================================
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        as: 'cart_items', 
        include: [{ 
          model: Product, 
          as: 'product', 
          attributes: ['id', 'name', 'price', 'stock'], 
          include: [{ model: ProductImage, as: 'images', attributes: ['image_url'] }] 
        }]
      }]
    });

    // Savat bo'sh bo'lsa yoki itemlar bo'lmasa
    if (!cart || !cart.cart_items || !cart.cart_items.length) {
      return ApiResponse.send(res, "Savat bo'sh", { cart_items: [], total_price: 0 });
    }

    // 💰 Har bir mahsulot subtotalini va savatning umumiy summasini hisoblash
    let total_price = 0;
    const itemsWithSubtotal = cart.cart_items.map(item => {
      const itemData = item.toJSON();
      const price = parseFloat(itemData.product?.price || 0);
      itemData.subtotal = price * itemData.quantity; // individual subtotal
      total_price += itemData.subtotal;
      return itemData;
    });

    // To'liq formatlangan javobni qaytarish
    return ApiResponse.send(res, "Savat ma'lumotlari yuklandi", {
      id: cart.id,
      user_id: cart.user_id,
      cart_items: itemsWithSubtotal,
      total_price: total_price // Savatning umumiy qiymati
    });

  } catch (error) {
    throw error;
  }
};

// ========================================================
// 2. SAVATGA MAHSULOT QO'SHISH (TRANSACTION BILAN)
// ========================================================
exports.addToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  const { product_id, quantity } = req.body;
  const qty = parseInt(quantity);

  try {
    if (!qty || qty <= 0) {
      throw new AppError("Miqdor kamida 1 ta bo'lishi kerak", 400);
    }

    const product = await Product.findByPk(product_id, { transaction });
    if (!product) {
      throw new AppError("Mahsulot topilmadi", 404);
    }

    // Savatni olish yoki yangi ochish
    let [cart] = await Cart.findOrCreate({ 
      where: { user_id: req.user.id }, 
      transaction 
    });

    // Savatda ushbu mahsulot oldin bor-yo'qligini tekshirish
    let item = await CartItem.findOne({ 
      where: { cart_id: cart.id, product_id }, 
      transaction 
    });

    const currentQtyInCart = item ? item.quantity : 0;
    const totalNewQty = currentQtyInCart + qty;

    // Omborda (Stock) yetarli mahsulot borligini tekshirish
    if (product.stock < totalNewQty) {
      throw new AppError(`Kechirasiz, omborda yetarli mahsulot yo'q. Maksimal qoldiq: ${product.stock} ta.`, 400);
    }

    if (item) {
      item.quantity += qty;
      await item.save({ transaction });
    } else {
      item = await CartItem.create({ 
        cart_id: cart.id, 
        product_id, 
        quantity: qty 
      }, { transaction });
    }

    await transaction.commit();
    return ApiResponse.send(res, "Mahsulot savatga qo'shildi 🛒", item, 201);

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ========================================================
// 3. SAVATDAGI MIQDORNI O'ZGARTIRISH (PUT)
// ========================================================
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;
  const qty = parseInt(quantity);

  if (qty <= 0) {
    throw new AppError("Miqdor kamida 1 ta bo'lishi kerak", 400);
  }

  const cart = await Cart.findOne({ where: { user_id: req.user.id } });
  if (!cart) throw new AppError("Savat topilmadi", 404);

  const cartItem = await CartItem.findOne({
    where: { id, cart_id: cart.id },
    include: [{ model: Product, as: 'product' }]
  });

  if (!cartItem) {
    throw new AppError("Savatda bunday mahsulot topilmadi", 404);
  }

  // Ombordagi (Stock) qoldiqni tekshirish
  if (cartItem.product && cartItem.product.stock < qty) {
    throw new AppError(`Omborda bor-yo'g'i ${cartItem.product.stock} ta mahsulot bor!`, 400);
  }

  cartItem.quantity = qty;
  await cartItem.save();

  return ApiResponse.send(res, "Savatdagi mahsulot miqdori yangilandi 🔄", cartItem);
};

// ========================================================
// 4. SAVATDAN MAHSULOTNI O'CHIRISH (DELETE)
// ========================================================
exports.removeFromCart = async (req, res) => {
  const { id } = req.params;

  const cart = await Cart.findOne({ where: { user_id: req.user.id } });
  if (!cart) throw new AppError("Savat topilmadi", 404);

  const cartItem = await CartItem.findOne({
    where: { id, cart_id: cart.id }
  });

  if (!cartItem) {
    throw new AppError("O'chirish uchun mahsulot topilmadi", 404);
  }

  await cartItem.destroy();
  return ApiResponse.send(res, "Mahsulot savatdan muvaffaqiyatli o'chirildi 🗑️", null);
};