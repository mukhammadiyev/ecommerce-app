const { Cart, CartItem, Product, ProductImage } = require('../models/associations'); 
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Foydalanuvchi savatini olish
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({
    where: { user_id: req.user.id },
    include: [{
      model: CartItem,
      as: 'cart_items', 
      include: [{ 
        model: Product, 
        as: 'product', 
        attributes: ['id', 'name', 'price', 'stock'], // ⚙️ stock front-end uchun ham qo'shildi
        include: [{ model: ProductImage, as: 'images', attributes: ['image_url'] }] 
      }]
    }]
  });

  if (!cart || !cart.cart_items || !cart.cart_items.length) {
    return ApiResponse.send(res, "Savat bo'sh", { cart_items: [] });
  }

  return ApiResponse.send(res, "Savat ma'lumotlari yuklandi", cart);
};

// ⚡ 2. Savatga mahsulot qo'shish qismini shunday o'zgartiring:
exports.addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = parseInt(quantity);

  if (!qty || qty <= 0) {
    throw new AppError("Miqdor kamida 1 ta bo'lishi kerak", 400);
  }

  const product = await Product.findByPk(product_id);
  if (!product) {
    throw new AppError("Mahsulot topilmadi", 404);
  }

  let [cart] = await Cart.findOrCreate({ where: { user_id: req.user.id } });
  let item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });

  const currentQtyInCart = item ? item.quantity : 0;
  const totalNewQty = currentQtyInCart + qty;

  // 🚨 MAX 50 TA LIMIT TEKSHIRUVI (BACKEND)
  if (totalNewQty > 50) {
    throw new AppError(`Bitta mahsulotdan jami 50 tadan ko'p buyurtma berish taqiqlangan! Savatingizda allaqachon ${currentQtyInCart} ta bor.`, 400);
  }

  // Stock tekshiruvi
  if (product.stock < totalNewQty) {
    throw new AppError(`Kechirasiz, omborda yetarli mahsulot yo'q. Maksimal qoldiq: ${product.stock} ta.`, 400);
  }

  if (item) {
    item.quantity += qty;
    await item.save();
  } else {
    item = await CartItem.create({ cart_id: cart.id, product_id, quantity: qty });
  }

  return ApiResponse.send(res, "Mahsulot savatga qo'shildi 🛒", item, 201);
};


// ⚡ 3. Savatdagi mahsulot miqdorini o'zgartirish (PUT) qismini shunday o'zgartiring:
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;
  const qty = parseInt(quantity);

  if (qty <= 0) {
    throw new AppError("Miqdor kamida 1 ta bo'lishi kerak", 400);
  }

  // 🚨 MAX 50 TA LIMIT TEKSHIRUVI (BACKEND)
  if (qty > 50) {
    throw new AppError("Bitta mahsulot uchun ruxsat etilgan maksimal miqdor 50 ta!", 400);
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

  if (cartItem.product && cartItem.product.stock < qty) {
    throw new AppError(`Omborda bor-yo'g'i ${cartItem.product.stock} ta mahsulot bor!`, 400);
  }

  cartItem.quantity = qty;
  await cartItem.save();

  return ApiResponse.send(res, "Savatdagi mahsulot miqdori yangilandi 🔄", cartItem);
};


// 4. Savatdan mahsulotni o'chirish (DELETE)
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