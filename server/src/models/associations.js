// src/models/associations.js
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
const Blog = require('./Blog');
const BlogImage = require('./BlogImage');
const Invoice = require('./Invoice');
const Contact = require('./Contact');
const Newsletter = require('./Newsletter');

// 1. Product <-> ProductImage (1:M)
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 2. User <-> Cart (1:1)
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 3. Cart <-> CartItem (1:M) (Alias nomlari kichik harflarda standartga keltirildi ⚙️)
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'cart_items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// 4. Product <-> CartItem (1:M) (Alias qo'shildi 🆕)
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cart_items', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 5. User <-> Order (1:M)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 6. Order <-> OrderItem (1:M) (Alias qo'shildi 🆕)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'order_items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// 7. Product <-> OrderItem (1:M) (Alias qo'shildi 🆕)
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 8. Category <-> Product (1:M)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 9. User <-> Review (1:M)
User.hasMany(Review, { foreignKey: 'user_id', as: 'user_reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 10. Product <-> Review (1:M)
Product.hasMany(Review, { foreignKey: 'product_id', as: 'product_reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 11. User <-> Address (1:1) (Address uchun qarama-qarshi alias to'g'rilandi ⚙️)
User.hasOne(Address, { foreignKey: 'user_id', as: 'address', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 12. User & Order <-> Payment
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments', onDelete: 'CASCADE' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// ==========================================
// 🆕 YANGI QO'SHILGAN BOG'LANISHLAR
// ==========================================

// 13. Blog <-> BlogImage (1:M)
Blog.hasMany(BlogImage, { foreignKey: 'blog_id', as: 'blog_images', onDelete: 'CASCADE' });
BlogImage.belongsTo(Blog, { foreignKey: 'blog_id', as: 'blog' });

// 14. User <-> Blog (Mualliflik) (1:M)
User.hasMany(Blog, { foreignKey: 'author_id', as: 'blogs', onDelete: 'SET NULL' });
Blog.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// 15. Order <-> Invoice (1:1)
Order.hasOne(Invoice, { foreignKey: 'order_id', as: 'invoice', onDelete: 'CASCADE' });
Invoice.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = { 
  User, Product, ProductImage, Cart, CartItem, 
  Order, OrderItem, Category, Review, Address, Payment,
  Blog, BlogImage, Invoice, Contact, 
  Newsletter, 
};