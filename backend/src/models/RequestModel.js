const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class RequestModel extends Model {}

RequestModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    voter_id: { type: DataTypes.UUID, allowNull: false },
    region_id: { type: DataTypes.UUID, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    priority: {
      type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
      defaultValue: 'media',
    },
    photo_url: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM('recebida', 'em_analise', 'encaminhada', 'respondida', 'concluida'),
      defaultValue: 'recebida',
    },
  },
  { sequelize, modelName: 'RequestModel', tableName: 'requests', underscored: true }
);

module.exports = RequestModel;
