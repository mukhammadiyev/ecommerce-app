const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Bir xil nomli kategoriya qayta ochilmasligi uchun
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true // Figma bosh sahifasida kategoriyalar rasmlari bilan turibdi
  }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true
});

module.exports = Category;