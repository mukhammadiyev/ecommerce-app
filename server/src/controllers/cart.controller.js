const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Foydalanuvchi savatini olish
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({
    where: { user_id: req.user.id },
    include: [{ model: CartItem, include: [Product] }]
  });

  if (!cart) {
    return ApiResponse.send(res, "Savat bo'sh", { items: [] });
  }

  return ApiResponse.send(res, "Savat ma'lumotlari yuklandi", cart);
};

// 2. Savatga mahsulot qo'shish
exports.addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;

  const product = await Product.findByPk(product_id);
  if (!product) {
    throw new AppError("Mahsulot topilmadi", 404);
  }

  let [cart] = await Cart.findOrCreate({ where: { user_id: req.user.id } });
  
  let item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });
  if (item) {
    item.quantity += quantity;
    await item.save();
  } else {
    item = await CartItem.create({ cart_id: cart.id, product_id, quantity });
  }

  return ApiResponse.send(res, "Mahsulot savatga qo'shildi", item, 201);
};

// 3. Savatdagi mahsulot miqdorini o'zgartirish (PUT) 🆕
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body; // Yangi miqdor
  const { id } = req.params;     // CartItem ID'si

  const cartItem = await CartItem.findByPk(id, {
    include: [{ model: Cart, where: { user_id: req.user.id } }] // Faqat o'zining savatidagisini o'zgartirishi uchun
  });

  if (!cartItem) {
    throw new AppError("Savatda bunday mahsulot topilmadi", 404);
  }

  if (quantity <= 0) {
    throw new AppError("Miqdor kamida 1 ta bo'lishi kerak", 400);
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  return ApiResponse.send(res, "Savatdagi mahsulot miqdori yangilandi 🔄", cartItem);
};

// 4. Savatdan mahsulotni o'chirish (DELETE) 🆕
exports.removeFromCart = async (req, res) => {
  const { id } = req.params; // CartItem ID'si

  const cartItem = await CartItem.findByPk(id, {
    include: [{ model: Cart, where: { user_id: req.user.id } }] // Faqat o'zining savatidagisini o'chira olishi uchun
  });

  if (!cartItem) {
    throw new AppError("O'chirish uchun mahsulot topilmadi", 404);
  }

  await cartItem.destroy();

  return ApiResponse.send(res, "Mahsulot savatdan muvaffaqiyatli o'chirildi 🗑️");
};