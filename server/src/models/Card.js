const { DataTypes } = require('sequelize');
// 🛠️ TUZATILDI: database.js faylingizdan kelayotgan { sequelize } obyekt qavs ichiga olindi
const { sequelize } = require('../config/database'); 

const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  card_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  card_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.STRING(5), // "MM/YY"
    allowNull: false
  },
  cvc: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'cards',
  timestamps: true,
  underscored: true // database.js dagi sozlamangizga moslandi
});

module.exports = Card;