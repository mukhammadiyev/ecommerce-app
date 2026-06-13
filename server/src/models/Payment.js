const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  user_id: { // 🆕 Kim toʻlov qilganini bilish uchun
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  payment_method: { // 🆕 'click', 'payme', 'card', 'cash'
    type: DataTypes.STRING,
    allowNull: false
  },
  card_mask: { // 🔒 Xavfsizlik uchun toʻliq karta emas, faqat maskasi saqlanadi (masalan: 8600****1234)
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), // 🆕 'refunded' qoʻshildi
    defaultValue: 'pending'
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true
});

module.exports = Payment;