require('dotenv').config();
const app = require('./src/app');
const { sequelize, connectDB } = require('./src/config/database');

require('./src/models/associations'); 
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Bazaga ulanish
    await connectDB();

    // 2. Modellar sinxronizatsiyasi
    await sequelize.sync(); 
    console.log('🔄 Jadvallar tekshirildi, tizim tayyor!');

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