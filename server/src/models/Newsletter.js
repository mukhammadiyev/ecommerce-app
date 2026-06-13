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
    unique: true, 
    validate: {
      isEmail: true,
    },
  },
}, {
  tableName: 'newsletters',
  timestamps: true,
  underscored: true, // 🆕 Ustun nomlarini snake_case formatiga o'tkazadi
});

module.exports = Newsletter;