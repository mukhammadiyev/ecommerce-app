const Product = require('../models/product');
const { Op } = require('sequelize'); // Sequelize operatorlari qidiruv uchun shart!

// ==========================================
// YANGI MAHSULOT QO'SHISH (ADMIN)
// ==========================================
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body;

    const newProduct = await Product.create({
      name, description, price, stock, image_url, category_id // Agar kategoriyani ishlatsangiz buni ham qo'shib ketamiz
    });

    res.status(201).json({ success: true, message: "Mahsulot muvaffaqiyatli qo'shildi! 🛍️", data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// MAHSULOTLARNI OLISH, QIDIRISH VA FILTERLASH
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    // URL'dan query parametrlarni qabul qilamiz
    const { search, minPrice, maxPrice, category_id } = req.query;

    let whereCondition = {};

    // 1. Nomi yoki tavsifi bo'yicha qidiruv
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // 2. Kategoriya bo'yicha filter
    if (category_id) {
      whereCondition.category_id = category_id;
    }

    // 3. Narxlar oralig'i (Min va Max Price)
    if (minPrice || maxPrice) {
      whereCondition.price = {};
      if (minPrice) whereCondition.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereCondition.price[Op.lte] = parseFloat(maxPrice);
    }

    // Shartlar asosida bazadan qidiramiz
    const products = await Product.findAll({
      where: whereCondition,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};