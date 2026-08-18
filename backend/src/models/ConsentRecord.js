const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ConsentRecord extends Model {}

ConsentRecord.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    subject_type: {
      type: DataTypes.ENUM('voter', 'registration'),
      allowNull: false,
    },
    subject_id: { type: DataTypes.UUID, allowNull: false },
    consent_type: { type: DataTypes.STRING, allowNull: false }, // ex.: "termos_e_privacidade", "contato_cabo"
    granted_at: { type: DataTypes.DATE, allowNull: false },
    revoked_at: { type: DataTypes.DATE, allowNull: true },
    collected_by: { type: DataTypes.UUID, allowNull: true }, // ex.: id do cabo, quando aplicável
    evidence: { type: DataTypes.TEXT, allowNull: true }, // ex.: "assinatura digital", "aceite no app"
  },
  { sequelize, modelName: 'ConsentRecord', tableName: 'consent_records', underscored: true }
);

module.exports = ConsentRecord;
