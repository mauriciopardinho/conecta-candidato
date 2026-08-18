const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Registro agregado de produção diária por cabo/região — é a única fonte de
// dados que o módulo de ML consome.
class ProductionRecord extends Model {}

ProductionRecord.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    agent_id: { type: DataTypes.UUID, allowNull: false },
    region_id: { type: DataTypes.UUID, allowNull: false },
    record_date: { type: DataTypes.DATEONLY, allowNull: false },
    registrations_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'ProductionRecord',
    tableName: 'production_records',
    underscored: true,
    indexes: [{ fields: ['agent_id', 'record_date'] }, { fields: ['region_id', 'record_date'] }],
  }
);

module.exports = ProductionRecord;
