const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true // Maqola rasmi uchun
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Oliver Bennett'
  },
  // 🆕 Mana shu qismni model ichiga qo'shib qo'ying:
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'blogs',
  timestamps: true,
  underscored: true
});

module.exports = Blog;