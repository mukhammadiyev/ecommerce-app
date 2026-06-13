const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    onDelete: 'CASCADE' 
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

module.exports = BlogImage;