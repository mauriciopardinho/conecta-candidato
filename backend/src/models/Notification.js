const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {}

Notification.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    read_at: { type: DataTypes.DATE, allowNull: true },
    channel: {
      type: DataTypes.ENUM('in_app', 'whatsapp'),
      defaultValue: 'in_app',
    },
  },
  { sequelize, modelName: 'Notification', tableName: 'notifications', underscored: true }
);

module.exports = Notification;
