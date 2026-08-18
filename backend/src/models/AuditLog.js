const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class AuditLog extends Model {}

AuditLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    actor_user_id: { type: DataTypes.UUID, allowNull: true },
    actor_role: { type: DataTypes.STRING, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false }, // ex.: "LOGIN", "CREATE_REGISTRATION"
    entity: { type: DataTypes.STRING, allowNull: true }, // ex.: "Registration"
    entity_id: { type: DataTypes.UUID, allowNull: true },
    ip_address: { type: DataTypes.STRING, allowNull: true },
    metadata: { type: DataTypes.TEXT, allowNull: true }, // JSON stringificado
  },
  { sequelize, modelName: 'AuditLog', tableName: 'audit_logs', underscored: true }
);

module.exports = AuditLog;
