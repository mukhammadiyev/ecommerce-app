const { Category } = require('../models/associations'); // ⚙️ Markaziy fayldan import qilamiz
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Barcha kategoriyalarni olish
exports.getAllCategories = async (req, res) => {
  // Alifbo tartibida tartiblab olish frontend uchun ham qulay
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  return ApiResponse.send(res, "Kategoriyalar ro'yxati keltirildi", categories);
};

// 2. Yangi kategoriya yaratish (Rasm mantiqi olib tashlandi 🧹)
exports.createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError("Kategoriya nomi (name) kiritilishi shart!", 400);
  }

  // Nom unikal bo'lgani uchun avval tekshiramiz
  const existing = await Category.findOne({ where: { name } });
  if (existing) {
    throw new AppError("Bunday kategoriya allaqachon mavjud!", 400);
  }

  const newCategory = await Category.create({ name });
  return ApiResponse.send(res, "Kategoriya yaratildi! 📂", newCategory, 201);
};

// 3. Kategoriyani yangilash (PUT - Rasm mantiqi olib tashlandi 🧹)
exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new AppError("Tahrirlash uchun kategoriya topilmadi", 404);
  }

  // Agar yangi nom kelgan bo'lsa va u eskisidan farq qilsa, unikal mudofaa
  if (name && name !== category.name) {
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      throw new AppError("Bu nomdagi kategoriya allaqachon mavjud!", 400);
    }
    category.name = name;
  }

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
  return ApiResponse.send(res, "Kategoriya muvaffaqiyatli o'chirildi! 🗑️", null);
};