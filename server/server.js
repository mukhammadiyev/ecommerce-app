require('dotenv').config();
const app = require('./src/app');
const { sequelize, connectDB } = require('./src/config/database');

// Modellarni to'g'ri kichik harfli yo'llar bilan yuklaymiz
const User = require('./src/models/user');
const Product = require('./src/models/product');
const Cart = require('./src/models/cart');      
const CartItem = require('./src/models/cartitem');  
const Order = require('./src/models/order');
const OrderItem = require('./src/models/orderitem');

// === SEQUELIZE JADVALLARARO BOG'LANISHLAR (RELATIONS) ===
// User <-> Cart (1:1)
User.hasOne(Cart, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

// Cart <-> CartItem (1:M)
Cart.hasMany(CartItem, { foreignKey: 'cart_id', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

// Product <-> CartItem (1:M)
Product.hasMany(CartItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });


// === BUYURTMA BOG'LANISHLARI ===
// User <-> Order (1:M)
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// Order <-> OrderItem (1:M)
Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// Product <-> OrderItem (1:M)
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Bazaga ulanish
    await connectDB();

    // 2. Modellar sinxronizatsiyasi
    await sequelize.sync({ alter: true });
    console.log('🔄 Modellar MySQL jadvali bilan muvaffaqiyatli sinxronlandi!');

    // 3. Serverni portga qo'yish
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 Server http://localhost:${PORT} portida ishlamoqda.`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('❌ Serverni ishga tushirishda jiddiy xatolik:', error.message);
    process.exit(1);
  }
};

startServer();