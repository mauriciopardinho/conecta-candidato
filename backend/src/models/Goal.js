const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Goal extends Model {}

Goal.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    agent_id: { type: DataTypes.UUID, allowNull: true },
    region_id: { type: DataTypes.UUID, allowNull: true },
    period_start: { type: DataTypes.DATEONLY, allowNull: false },
    period_end: { type: DataTypes.DATEONLY, allowNull: false },
    target_count: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Goal', tableName: 'goals', underscored: true }
);

module.exports = Goal;
