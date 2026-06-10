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
  card_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  card_number: {
    type: DataTypes.STRING, // To'liq saqlamaslik yoki oxirgi 4 raqamini saqlash tavsiya etiladi
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true
});

module.exports = Payment;