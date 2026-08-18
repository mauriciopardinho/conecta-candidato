const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// IMPORTANTE: este modelo deliberadamente NÃO possui nenhuma coluna sobre
// intenção de voto, opinião política, religião, raça ou orientação sexual.
class Voter extends Model {}

Voter.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    region_id: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, modelName: 'Voter', tableName: 'voters', underscored: true }
);

module.exports = Voter;
