const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Blog = require('./Blog'); // Blog modeliga bog'lash uchun

const BlogImage = sequelize.define('BlogImage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  blog_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'blogs',
      key: 'id'
    },
    onDelete: 'CASCADE' // Blog o'chib ketsa, rasmlari ham avtomat o'chadi
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'blog_images',
  timestamps: true,
  underscored: true
});

// Modellarni o'zaro bog'laymiz (Relations)
Blog.hasMany(BlogImage, { as: 'images', foreignKey: 'blog_id' });
BlogImage.belongsTo(Blog, { as: 'blog', foreignKey: 'blog_id' });

module.exports = BlogImage;