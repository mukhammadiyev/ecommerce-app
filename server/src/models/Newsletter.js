const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Newsletter = sequelize.define('Newsletter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Bir xil email ikki marta obuna bo'lolmaydi
    validate: {
      isEmail: true,
    },
  },
}, {
  tableName: 'newsletters',
  timestamps: true,
});

module.exports = Newsletter;