const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

const CATEGORIES = [
  'saude', 'educacao', 'seguranca', 'infraestrutura', 'transporte',
  'emprego', 'esporte', 'cultura', 'meio_ambiente', 'outras',
];

class Suggestion extends Model {}

Suggestion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    voter_id: { type: DataTypes.UUID, allowNull: false },
    proposal_id: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    region_id: { type: DataTypes.UUID, allowNull: true },
    category: { type: DataTypes.ENUM(...CATEGORIES), allowNull: false },
    attachment_url: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM('recebida', 'em_analise', 'encaminhada', 'respondida', 'concluida'),
      defaultValue: 'recebida',
    },
    admin_response: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: 'Suggestion', tableName: 'suggestions', underscored: true }
);

Suggestion.CATEGORIES = CATEGORIES;
module.exports = Suggestion;
