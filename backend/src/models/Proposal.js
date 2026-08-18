const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Proposal extends Model {}

Proposal.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: true },
    region_id: { type: DataTypes.UUID, allowNull: true },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published',
    },
    published_at: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'Proposal', tableName: 'proposals', underscored: true }
);

module.exports = Proposal;
