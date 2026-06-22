const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CouponUsage = sequelize.define('CouponUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  coupon_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'coupon_usages',
  timestamps: true,
  indexes: [
    {
      name: 'unique_coupon_user_idx', // Indeks nomi qat'iy belgilandi (ustma-ust tushib max 64 xatosi bermaydi)
      unique: true,
      fields: ['coupon_id', 'user_id'] // Baza darajasida 2-marta yozishni taqiqlaydi
    }
  ]
});

module.exports = CouponUsage;