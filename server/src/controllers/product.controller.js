const { Product, ProductImage, Category, Review } = require('../models/associations'); 
const { Op } = require('sequelize');
const ApiResponse = require('../utils/response');
const AppError = require('../utils/appError');

// 1. Yangi mahsulot yaratish (Bulutli rasm yuklash va DISCOUNT bilan) ✅
exports.createProduct = async (req, res) => {
  const { name, description, price, stock, category_id, discount } = req.body;

  if (!req.files || !req.files['image']) {
    throw new AppError("Mahsulotning asosiy rasmini ('image') yuklash shart!", 400);
  }
  const image_url = req.files['image'][0].path; 

  let imagesData = [];
  if (req.files['gallery']) {
    imagesData = req.files['gallery'].map(file => ({ image_url: file.path }));
  }

  // Mahsulotni bazaga yozish (stock majburiy raqamga o'girildi)
  const newProduct = await Product.create({
    name, 
    description, 
    price, 
    stock: stock ? parseInt(stock) : 0, // 🔥 Xavfsiz raqam formati
    image_url, 
    category_id,
    discount: discount ? parseInt(discount) : 0, 
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

  return ApiResponse.send(res, "Mahsulot va galereya muvaffaqiyatli saqlandi! 🚀", completeProduct, 201);
};

// 2. Barcha mahsulotlarni filtrlash va qidiruv bilan olish
exports.getAllProducts = async (req, res) => {
  const { search, minPrice, maxPrice, category_id, sortBy } = req.query;
  let whereCondition = {};

  if (search) {
    whereCondition[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  if (category_id) {
    whereCondition.category_id = category_id;
  }

  if (minPrice || maxPrice) {
    whereCondition.price = {};
    if (minPrice) whereCondition.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) whereCondition.price[Op.lte] = parseFloat(maxPrice);
  }

  let orderClause = [['createdAt', 'DESC']];
  if (sortBy === 'price_low') {
    orderClause = [['price', 'ASC']];
  } else if (sortBy === 'price_high') {
    orderClause = [['price', 'DESC']];
  }

  const products = await Product.findAll({
    where: whereCondition,
    attributes: ['id', 'name', 'description', 'price', 'stock', 'image_url', 'discount', 'category_id'],
    include: [
      { model: ProductImage, as: 'images', attributes: ['id', 'image_url'] },
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Review, as: 'product_reviews' } 
    ],
    order: orderClause
  });

  return ApiResponse.send(res, "Mahsulotlar ro'yxati yuklandi", products);
};

// 3. ID bo'yicha bitta mahsulotni olish (Dublikat olib tashlandi, attributes saqlandi! 🚀)
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id, {
    attributes: ['id', 'name', 'description', 'price', 'stock', 'image_url', 'discount', 'category_id'],
    include: [
      { model: ProductImage, as: 'images', attributes: ['id', 'image_url'] },
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Review, as: 'product_reviews' } 
    ]
  });

  if (!product) {
    throw new AppError("Mahsulot topilmadi!", 404);
  }

  return ApiResponse.send(res, "Mahsulot topildi", product);
};

// 4. Mahsulotni tahrirlash (PUT)
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id, discount } = req.body;

  const product = await Product.findByPk(id);
  
  if (!product) {
    throw new AppError("Mahsulot topilmadi!", 404);
  }

  if (req.files && req.files['image']) {
    product.image_url = req.files['image'][0].path;
  }

  if (req.files && req.files['gallery']) {
    await ProductImage.destroy({ where: { product_id: id } });
    
    const newImages = req.files['gallery'].map(file => ({
      product_id: id,
      image_url: file.path
    }));
    await ProductImage.bulkCreate(newImages);
  }

  product.name = name !== undefined ? name : product.name;
  product.description = description !== undefined ? description : product.description;
  product.price = price !== undefined ? price : product.price;
  product.stock = stock !== undefined ? parseInt(stock) : product.stock; // 🔥 Tahrirlanganda ham raqam qilinadi
  product.category_id = category_id !== undefined ? category_id : product.category_id;
  product.discount = discount !== undefined ? parseInt(discount) : product.discount;

  await product.save();

  const updatedProduct = await Product.findByPk(id, {
    include: [{ model: ProductImage, as: 'images', attributes: ['id', 'image_url'] }]
  });

  return ApiResponse.send(res, "Mahsulot muvaffaqiyatli yangilandi! 🆙", updatedProduct);
};

// 5. Mahsulotni o'chirish
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new AppError("Mahsulot topilmadi!", 404);
  }

  await product.destroy();
  return ApiResponse.send(res, "Mahsulot muvaffaqiyatli o'chirildi! 🗑️", null);
};