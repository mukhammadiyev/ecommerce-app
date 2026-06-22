const { sequelize } = require('../config/database');

const User = require('./user');
const Product = require('./product');
const ProductImage = require('./ProductImage');
const Cart = require('./cart');
const CartItem = require('./cartitem');
const Order = require('./order');
const OrderItem = require('./orderitem');
const Category = require('./category');
const Review = require('./review');
const Address = require('./address');
const Payment = require('./payment');
const Card = require('./card');
const Blog = require('./Blog');
const BlogImage = require('./BlogImage');
const Invoice = require('./Invoice');
const Contact = require('./Contact');
const Newsletter = require('./Newsletter');
const Coupon = require('./coupon'); 
const CouponUsage = require('./couponUsage'); 

const setupAssociations = () => {
  // Product <-> ProductImage
  Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
  ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // User <-> Cart
  User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart', onDelete: 'CASCADE' });
  Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Cart <-> CartItem
  Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'cart_items', onDelete: 'CASCADE' });
  CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

  // Product <-> CartItem
  Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cart_items', onDelete: 'CASCADE' });
  CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // User <-> Order
  User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Order <-> OrderItem
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'order_items', onDelete: 'CASCADE' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  // Product <-> OrderItem
  Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Category <-> Product
  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'SET NULL' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  // User <-> Review
  User.hasMany(Review, { foreignKey: 'user_id', as: 'user_reviews', onDelete: 'CASCADE' });
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Product <-> Review
  Product.hasMany(Review, { foreignKey: 'product_id', as: 'product_reviews', onDelete: 'CASCADE' });
  Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // User <-> Address
  User.hasOne(Address, { foreignKey: 'user_id', as: 'address', onDelete: 'CASCADE' });
  Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User & Order <-> Payment
  User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments', onDelete: 'CASCADE' });
  Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment', onDelete: 'CASCADE' });
  Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  if (Card) {
    User.hasMany(Card, { foreignKey: 'user_id', as: 'cards', onDelete: 'CASCADE' });
    Card.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  }

  // Blog <-> BlogImage
  Blog.hasMany(BlogImage, { foreignKey: 'blog_id', as: 'blog_images', onDelete: 'CASCADE' });
  BlogImage.belongsTo(Blog, { foreignKey: 'blog_id', as: 'blog' });

  // User <-> Blog
  User.hasMany(Blog, { foreignKey: 'author_id', as: 'blogs', onDelete: 'SET NULL' });
  Blog.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

  // Order <-> Invoice
  Order.hasOne(Invoice, { foreignKey: 'order_id', as: 'invoice', onDelete: 'CASCADE' });
  Invoice.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  // Kupon bog'liqliklari
  Coupon.hasMany(CouponUsage, { foreignKey: 'coupon_id', as: 'usages' });
  CouponUsage.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

  User.hasMany(CouponUsage, { foreignKey: 'user_id', as: 'coupon_usages' });
  CouponUsage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};

setupAssociations();

module.exports = {
  User, Product, ProductImage, Cart, CartItem,
  Order, OrderItem, Category, Review, Address, Payment, Card,
  Blog, BlogImage, Invoice, Contact, Newsletter,
  Coupon, CouponUsage,
  sequelize
};