const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class FieldAgent extends Model {}

FieldAgent.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    region_id: { type: DataTypes.UUID, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_by_admin_id: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, modelName: 'FieldAgent', tableName: 'field_agents', underscored: true }
);

module.exports = FieldAgent;
