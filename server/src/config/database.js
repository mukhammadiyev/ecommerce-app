const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('📦 MySQL bazasiga ulanish muvaffaqiyatli amalga oshirildi.');
  } catch (error) {
    console.error('❌ Baza bilan ulanishda xatolik:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };