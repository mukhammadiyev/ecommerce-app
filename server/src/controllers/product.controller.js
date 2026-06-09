const Product = require('../models/product');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url } = req.body;

    const newProduct = await Product.create({ name, description, price, stock, image_url });

    res.status(201).json({ success: true, message: "Mahsulot muvaffaqiyatli qo'shildi! 🛍️", data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};