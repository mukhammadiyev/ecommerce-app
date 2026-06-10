const Blog = require('../models/Blog'); // Katta-kichik harfga e'tibor bering
const { Op } = require('sequelize');

// ==========================================
// 1. BARCHA BLOGLARNI OLISH (BLOGS LIST PAGE)
// ==========================================
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [['createdAt', 'DESC']] // Yangilari birinchi chiqadi
    });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bloglarni yuklashda xatolik", error: error.message });
  }
};

// ==========================================
// 2. BITTA BLOG VA TAVSIYA ETILGAN POSTLAR (DETAIL PAGE)
// ==========================================
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Maqola topilmadi!" });
    }

    // Figma pastidagi "Suggested Posts" uchun joriy blogdan tashqari yana 3 ta tasodifiy maqolani olamiz
    const suggestedBlogs = await Blog.findAll({
      where: {
        id: { [Op.ne]: id } // Joriy maqola chiqib ketishi uchun
      },
      limit: 3,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        currentBlog: blog,
        suggestedBlogs: suggestedBlogs // Frontender buni pastki qismga oson joylashtiradi 🎯
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};

// ==========================================
// 3. YANGI BLOG QO'SHISH (ADMIN PANEL UCHUN)
// ==========================================
exports.createBlog = async (req, res) => {
  try {
    const { title, content, image_url, author } = req.body;

    const newBlog = await Blog.create({
      title,
      content,
      image_url,
      author
    });

    res.status(201).json({
      success: true,
      message: "Yangi maqola muvaffaqiyatli chop etildi! ✍️",
      data: newBlog
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Serverda xatolik", error: error.message });
  }
};