const { Blog, BlogImage } = require('../models/associations'); // ⚙️ Markaziy fayldan import qilamiz
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Barcha nashr qilingan bloglarni galereyasi bilan olish
exports.getAllBlogs = async (req, res) => {
  const blogs = await Blog.findAll({
    where: { is_published: true },
    include: [{ model: BlogImage, as: 'blog_images', attributes: ['id', 'image_url'] }] // 🆕 associations.js dagi aliasga o'zgartirildi
  });
  return ApiResponse.send(res, "Bloglar ro'yxati", blogs);
};

// 2. ID bo'yicha bitta blogni galereyasi bilan olish
exports.getBlogById = async (req, res) => {
  const blog = await Blog.findByPk(req.params.id, {
    include: [{ model: BlogImage, as: 'blog_images', attributes: ['id', 'image_url'] }] // 🆕 alias to'g'rilandi
  });
  if (!blog) {
    throw new AppError("Blog topilmadi", 404);
  }
  return ApiResponse.send(res, "Blog tafsilotlari", blog);
};

// 3. Yangi blog yaratish (Muallif, Asosiy va galereya rasmlari bilan)
exports.createBlog = async (req, res) => {
  // 💡 req.body ichidan author_name ni ham ajratib olamiz
  const { title, content, author_name, author_image: textAuthorImage } = req.body;

  // Asosiy rasm tekshiruvi
  if (!req.files || !req.files['image']) {
    throw new AppError("Blogning asosiy rasmini ('image') yuklash shart!", 400);
  }
  const image_url = req.files['image'][0].path;

  // 💡 Muallif rasmini aniqlash (fayl yuklangan bo'lsa yo'lini olamiz, aks holda matnli URL)
  let author_image = textAuthorImage || "";
  if (req.files && req.files['author_image_file']) {
    author_image = req.files['author_image_file'][0].path;
  }

  // Galereya rasmlarini yig'ish
  let galleryData = [];
  if (req.files['gallery']) {
    galleryData = req.files['gallery'].map(file => ({ image_url: file.path }));
  }

  // Blog va uning rasmlarini birdaniga bazaga saqlash
  const newBlog = await Blog.create({
    title,
    content,
    image_url,
    author_name,   // 🌟 Muallif ismi bazaga yoziladi
    author_image,  // 🌟 Muallif rasmi bazaga yoziladi
    blog_images: galleryData
  }, {
    include: [{ model: BlogImage, as: 'blog_images' }]
  });

  // To'liq javobni qayta o'qib olish
  const completeBlog = await Blog.findByPk(newBlog.id, {
    include: [{ model: BlogImage, as: 'blog_images', attributes: ['id', 'image_url'] }]
  });

  return ApiResponse.send(res, "Yangi blog galereya va muallif bilan yaratildi 🚀", completeBlog, 201);
};

// 4. Blogni tahrirlash (PUT)
exports.updateBlog = async (req, res) => {
  // 💡 req.body'dan tegishli maydonlarni olamiz
  const { title, content, is_published, author_name, author_image: textAuthorImage } = req.body;
  const { id } = req.params;

  const blog = await Blog.findByPk(id);
  if (!blog) {
    throw new AppError("Tahrirlash uchun blog topilmadi", 404);
  }

  // Yangi asosiy rasm kelgan bo'lsa
  if (req.files && req.files['image']) {
    blog.image_url = req.files['image'][0].path;
  }

  // 💡 Muallif rasmi yangilangan bo'lsa
  if (req.files && req.files['author_image_file']) {
    blog.author_image = req.files['author_image_file'][0].path;
  } else if (textAuthorImage !== undefined) {
    blog.author_image = textAuthorImage;
  }

  // Yangi galereya rasmlari kelgan bo'lsa, eskilarni yangilash
  if (req.files && req.files['gallery']) {
    await BlogImage.destroy({ where: { blog_id: id } }); // eskilarni o'chirish

    const newImages = req.files['gallery'].map(file => ({
      blog_id: id,
      image_url: file.path
    }));
    await BlogImage.bulkCreate(newImages); // yangilarini yozish
  }

  // Oddiy maydonlarni yangilash
  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.author_name = author_name !== undefined ? author_name : blog.author_name; // 🌟 Yangilash
  if (is_published !== undefined) blog.is_published = is_published;

  await blog.save();

  const updatedBlog = await Blog.findByPk(id, {
    include: [{ model: BlogImage, as: 'blog_images', attributes: ['id', 'image_url'] }]
  });

  return ApiResponse.send(res, "Blog muvaffaqiyatli yangilandi! 📝", updatedBlog);
};

// 5. Blogni o'chirish (DELETE)
exports.deleteBlog = async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (!blog) {
    throw new AppError("O'chirish uchun blog topilmadi", 404);
  }

  await blog.destroy();
  return ApiResponse.send(res, "Blog muvaffaqiyatli o'chirildi! 🗑️", null);
};