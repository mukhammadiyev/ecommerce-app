const Category = require('../models/category');

// 1. HAMMA KATEGORIYALARNI OLISH
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// 2. YANGI KATEGORIYA QO'SHISH (Admin uchun)
exports.createCategory = async (req, res) => {
  try {
    const { name, image_url } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Kategoriya nomi majburiy!" });
    }
    
    const newCategory = await Category.create({ name, image_url });
    res.status(201).json({ success: true, message: "Kategoriya yaratildi! 📂", data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};