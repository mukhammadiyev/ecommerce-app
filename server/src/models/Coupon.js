const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      if (val) this.setDataValue('code', val.toUpperCase().trim());
    }
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    defaultValue: 'percentage',
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  expiry: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Expired'),
    defaultValue: 'Active',
    allowNull: false
  },
  // 🔥 To'g'rilangan maydon: Global 'underscored: true' bilan moslashtirildi
  usedBy: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    field: 'used_by' 
  }
}, {
  timestamps: true,
  tableName: 'coupons'
});

module.exports = Coupon;