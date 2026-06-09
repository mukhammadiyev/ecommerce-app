const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Product = require('./product');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5 // Faqat 1 dan 5 gacha baho qo'yish mumkin
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true
});

// Modellarni o'zaro bog'laymiz
Review.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'product_id', onDelete: 'CASCADE' });
Product.hasMany(Review, { foreignKey: 'product_id' });

module.exports = Review;