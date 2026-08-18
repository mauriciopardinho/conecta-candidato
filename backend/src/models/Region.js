const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Region extends Model {}

Region.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    monthly_goal: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, modelName: 'Region', tableName: 'regions', underscored: true }
);

module.exports = Region;
