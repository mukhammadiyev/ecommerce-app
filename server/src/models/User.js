const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // 🔥 TUZATILDI: first_name va last_name o'rniga bitta majburiy 'name' maydoni qo'shildi
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // 💡 Ixtiyoriy: Agar bazada eski ma'lumotlar bo'lsa xato bermasligi uchun 
  // last_name'ni ixtiyoriy (allowNull: true) qilib qo'yamiz
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'manager'),
    defaultValue: 'user'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true // database-da snake_case (created_at, updated_at) qiladi
});

module.exports = User;