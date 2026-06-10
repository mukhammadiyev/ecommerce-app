const Cart = require('../models/cart');
const CartItem = require('../models/cartitem');
const Product = require('../models/product');

// ==========================================
// SAVATCHAGA MAHSULOT QO'SHISH YOKI KO'PAYTIRISH
// ==========================================
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { product_id, quantity = 1 } = req.body;
    const reqQuantity = parseInt(quantity);

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Mahsulot topilmadi!" });
    }

    if (product.stock < reqQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Omborda yetarli mahsulot yo'q! Hozirgi qoldiq: ${product.stock} ta` 
      });
    }

    let [cart] = await Cart.findOrCreate({ where: { user_id: userId } });

    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: product_id }
    });

    if (cartItem) {
      // Agar savatda mahsulot bo'lsa, miqdorini oshiramiz
      await cartItem.increment('quantity', { by: reqQuantity });
      await cartItem.reload();
    } else {
      // Agar bo'lmasa, yangi qator yaratamiz
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: product_id,
        quantity: reqQuantity
      });
    }

    // Status kodini 201 Created qildik (Yangi resurs yaratilgani uchun)
    res.status(201).json({ 
      success: true, 
      message: "Mahsulot savatchaga muvaffaqiyatli qo'shildi! 🛒", 
      data: cartItem 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// FOYDALANUVCHI SAVATCHASINI KO'RISH
// ==========================================
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{
        model: CartItem,
        as: 'CartItems', // 👈 'items' emas, bazadagi asl taxallus 'CartItems' ga almashtirildi!
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'image_url']
        }]
      }]
    });

    // Endi tekshiruvni ham bazaga mos ravishda .CartItems orqali qilamiz
    if (!cart || !cart.CartItems || !cart.CartItems.length) {
      return res.status(200).json({ success: true, message: "Savatchangiz hozircha bo'sh", data: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};