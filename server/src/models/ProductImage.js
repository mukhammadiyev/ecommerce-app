const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  image_url: { type: DataTypes.STRING, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'product_images',
  timestamps: true,
  underscored: true
});

// Dynamic munosabat o'rnatish funksiyasi
ProductImage.associate = (models) => {
  ProductImage.belongsTo(models.Product, { foreignKey: 'product_id' });
};

module.exports = ProductImage;