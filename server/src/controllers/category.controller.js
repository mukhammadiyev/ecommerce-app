const Category = require('../models/category');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Barcha kategoriyalarni olish
exports.getAllCategories = async (req, res) => {
  const categories = await Category.findAll();
  return ApiResponse.send(res, "Kategoriyalar ro'yxati keltirildi", categories);
};

// 2. Yangi kategoriya yaratish
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  
  // 🆕 Agar rasm yuklangan bo'lsa, Cloudinary URL-ni olamiz, aks holda xatolik beramiz
  if (!req.file) {
    throw new AppError("Kategoriya uchun rasm yuklash shart!", 400);
  }
  const image_url = req.file.path; 

  const newCategory = await Category.create({ name, image_url });
  return ApiResponse.send(res, "Kategoriya yaratildi! 📂", newCategory, 201);
};

// 3. Kategoriyani yangilash (PUT)
exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new AppError("Tahrirlash uchun kategoriya topilmadi", 404);
  }

  // 🆕 Agar yangi rasm yuklangan bo'lsa, uni yangilaymiz, aks holda eskisi qoladi
  if (req.file) {
    category.image_url = req.file.path;
  }

  category.name = name || category.name;
  await category.save();

  return ApiResponse.send(res, "Kategoriya muvaffaqiyatli yangilandi! 🔄", category);
};

// 4. Kategoriyani o'chirish (DELETE)
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new AppError("O'chirish uchun kategoriya topilmadi", 404);
  }

  await category.destroy();
  return ApiResponse.send(res, "Kategoriya muvaffaqiyatli o'chirildi! 🗑️");
};