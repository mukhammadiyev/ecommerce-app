const Product = require('../models/product');
const ProductImage = require('../models/productimage');
const Category = require('../models/category');
const { Op } = require('sequelize');

// ==========================================
// YANGI MAHSULOT QO'SHISH (ADMIN)
// ==========================================
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id, images } = req.body;

    let imagesData = [];
    if (images && Array.isArray(images)) {
      imagesData = images.map(url => ({ image_url: url }));
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      image_url,
      category_id,
      images: imagesData
    }, {
      include: [{ model: ProductImage, as: 'images' }]
    });

    const completeProduct = await Product.findByPk(newProduct.id, {
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'image_url'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Mahsulot va galereya muvaffaqiyatli saqlandi! 🚀",
      data: completeProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// MAHSULOTLARNI OLISH, QIDIRISH VA FILTERLASH
// ==========================================
// MAHSULOTLARNI OLISH, QIDIRISH, FILTERLASH VA TARTIBLASH (SORTING)
exports.getAllProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, category_id, sortBy } = req.query;
    let whereCondition = {};

    // 1. Qidiruv mantiqi (Ismi va tavsifi bo'yicha)
    if (search) {
      const { Op } = require('sequelize');
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // 2. Kategoriya bo'yicha filter
    if (category_id) {
      whereCondition.category_id = category_id;
    }

    // 3. Narx oralig'i (Min/Max) bo'yicha filter
    if (minPrice || maxPrice) {
      const { Op } = require('sequelize');
      whereCondition.price = {};
      if (minPrice) whereCondition.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereCondition.price[Op.lte] = parseFloat(maxPrice);
    }

    // 4. Figma dizaynidagi "Sort by" mantiqi 📊
    let orderClause = [['createdAt', 'DESC']]; // "Default" yoki "Newest" holatda yangilari tepada chiqadi

    if (sortBy === 'price_low') {
      orderClause = [['price', 'ASC']];   // "Price: Low to High"
    } else if (sortBy === 'price_high') {
      orderClause = [['price', 'DESC']];  // "Price: High to Low"
    }

    const products = await Product.findAll({
      where: whereCondition,
      include: [
        { model: require('../models/productimage'), as: 'images', attributes: ['id', 'image_url'] },
        { model: require('../models/category'), as: 'category', attributes: ['id', 'name'] }
      ],
      order: orderClause
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi", error: error.message });
  }
};

// ==========================================
// BITTA MAHSULOTNI ID BO'YICHA OLISH
// ==========================================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'image_url'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Mahsulot topilmadi!" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};