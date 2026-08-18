const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    role: {
      type: DataTypes.ENUM('admin', 'field_agent', 'voter'),
      allowNull: false,
    },
    username: { type: DataTypes.STRING, unique: true, allowNull: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'inactive', 'blocked'),
      defaultValue: 'pending',
    },
    terms_accepted_at: { type: DataTypes.DATE, allowNull: true },
    last_login_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  }
);

module.exports = User;
