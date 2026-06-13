const { Cart, CartItem, Product, ProductImage } = require('../models/associations'); // ⚙️ Markaziy fayldan import qilamiz
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Foydalanuvchi savatini olish
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({
    where: { user_id: req.user.id },
    include: [{
      model: CartItem,
      as: 'cart_items', // ⚙️ associations.js dagi alias bilan moslashtirildi
      include: [{ 
        model: Product, 
        as: 'product', // ⚙️ Alias qo'shildi
        attributes: ['id', 'name', 'price'],
        include: [{ model: ProductImage, as: 'images', attributes: ['image_url'] }] // 🆕 Mahsulot rasmlari alohida jadvaldan olindi
      }]
    }]
  });

  // Kuchli tekshiruv: agar savat umuman bo'lmasa yoki ichi bo'sh bo'lsa
  if (!cart || !cart.cart_items || !cart.cart_items.length) {
    return ApiResponse.send(res, "Savat bo'sh", { cart_items: [] });
  }

  return ApiResponse.send(res, "Savat ma'lumotlari yuklandi", cart);
};

// 2. Savatga mahsulot qo'shish
exports.addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!quantity || quantity <= 0) {
    throw new AppError("Miqdor kamida 1 ta bo'lishi kerak", 400);
  }

  const product = await Product.findByPk(product_id);
  if (!product) {
    throw new AppError("Mahsulot topilmadi", 404);
  }

  // Savat bormi, yo'qmi tekshirib, bo'lmasa yaratadi
  let [cart] = await Cart.findOrCreate({ where: { user_id: req.user.id } });

  let item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });

  if (item) {
    item.quantity += parseInt(quantity);
    await item.save();
  } else {
    item = await CartItem.create({ cart_id: cart.id, product_id, quantity });
  }

  return ApiResponse.send(res, "Mahsulot savatga qo'shildi 🛒", item, 201);
};

// 3. Savatdagi mahsulot miqdorini o'zgartirish (PUT)
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;

  if (quantity <= 0) {
    throw new AppError("Miqdor kamida 1 ta bo'lishi kerak", 400);
  }

  const cart = await Cart.findOne({ where: { user_id: req.user.id } });
  if (!cart) throw new AppError("Savat topilmadi", 404);

  const cartItem = await CartItem.findOne({
    where: { id, cart_id: cart.id }
  });

  if (!cartItem) {
    throw new AppError("Savatda bunday mahsulot topilmadi", 404);
  }

  cartItem.quantity = quantity;
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