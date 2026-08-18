const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class WhatsappVerification extends Model {}

WhatsappVerification.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    code_hash: { type: DataTypes.STRING, allowNull: false },
    purpose: {
      type: DataTypes.ENUM('registration', 'password_reset'),
      defaultValue: 'registration',
    },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    consumed_at: { type: DataTypes.DATE, allowNull: true },
    attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, modelName: 'WhatsappVerification', tableName: 'whatsapp_verifications', underscored: true }
);

module.exports = WhatsappVerification;
