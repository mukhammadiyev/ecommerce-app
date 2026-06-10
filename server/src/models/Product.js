const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  image_url: { type: DataTypes.STRING, allowNull: true },
  category_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'categories', // 'categories' jadvaliga bog'lanadi
      key: 'id'
    }
  }
}, { 
  tableName: 'products',
  timestamps: true,
  underscored: true
});

// Dynamic munosabatlarni shu yerda kengaytiramiz
Product.associate = (models) => {
  // 1. Rasmlar galereyasi bilan bog'lanish (1:M)
  Product.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
  
  // 2. Kategoriya bilan bog'lanish (1:1) -> Figma-dagi filtr uchun 🚀
  Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
};

module.exports = Product;