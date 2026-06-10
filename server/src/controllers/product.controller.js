const Product = require('../models/product');
const ProductImage = require('../models/ProductImage'); 
const Category = require('../models/category'); // 👈 Kategoriya modeli qo'shildi
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

    // Mahsulot yaratiladi (agar category_id berilgan bo'lsa, unga avtomatik bog'lanadi)
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

    // Yangi yaratilgan mahsulotni kategoriya ma'lumotlari bilan qayta o'qib qaytaramiz
    const completeProduct = await Product.findByPk(newProduct.id, {
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'image_url'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] } // 👈 Kategoriya javob ichida chiqishi uchun
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
// MAHSULOTLARNI OLISH, QIDIRISH VA FILTERLASH (FIGMA DESIGN)
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, category_id } = req.query;

    let whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Figma dizaynida chap menyudan kategoriya bosilganda ishlaydigan filtr 📂
    if (category_id) {
      whereCondition.category_id = category_id;
    }

    if (minPrice || maxPrice) {
      whereCondition.price = {};
      if (minPrice) whereCondition.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereCondition.price[Op.lte] = parseFloat(maxPrice);
    }

    const products = await Product.findAll({
      where: whereCondition,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'image_url']
        },
        {
          model: Category, // 👈 Figma mahsulot kartochkasida toifa nomi ko'rinishi uchun
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
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

// ==========================================
// BITTA MAHSULOTNI ID BO'YICHA OLISH (PRODUCT DETAILS PAGE)
// ==========================================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'image_url']
        },
        {
          model: Category, // 👈 Single page sahifasidagi "Breadcrumb" (Kategoriya yo'li) uchun
          as: 'category',
          attributes: ['id', 'name']
        }
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