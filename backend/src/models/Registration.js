const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Cadastro de contato feito por um cabo eleitoral. Deliberadamente sem
// nenhuma coluna de intenção de voto, partido, opinião política, religião,
// raça ou orientação sexual — por design, não apenas por regra de negócio.
class Registration extends Model {}

Registration.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    region_id: { type: DataTypes.UUID, allowNull: false },
    registered_by_agent_id: { type: DataTypes.UUID, allowNull: false },
    registration_date: { type: DataTypes.DATEONLY, allowNull: false },
    operational_note: { type: DataTypes.TEXT, allowNull: true },
    consent_id: { type: DataTypes.UUID, allowNull: true },
    source: { type: DataTypes.STRING, allowNull: true }, // ex.: "abordagem presencial", "evento"
  },
  { sequelize, modelName: 'Registration', tableName: 'registrations', underscored: true }
);

module.exports = Registration;
