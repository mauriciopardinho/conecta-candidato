const sequelize = require('../config/database');

const User = require('./User');
const Region = require('./Region');
const Voter = require('./Voter');
const FieldAgent = require('./FieldAgent');
const Proposal = require('./Proposal');
const Suggestion = require('./Suggestion');
const RequestModel = require('./RequestModel');
const Registration = require('./Registration');
const ProductionRecord = require('./ProductionRecord');
const Goal = require('./Goal');
const Notification = require('./Notification');
const WhatsappVerification = require('./WhatsappVerification');
const ConsentRecord = require('./ConsentRecord');
const AuditLog = require('./AuditLog');

// --- Associações ---
User.hasOne(Voter, { foreignKey: 'user_id' });
Voter.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(FieldAgent, { foreignKey: 'user_id' });
FieldAgent.belongsTo(User, { foreignKey: 'user_id' });

Region.hasMany(Voter, { foreignKey: 'region_id' });
Voter.belongsTo(Region, { foreignKey: 'region_id' });

Region.hasMany(FieldAgent, { foreignKey: 'region_id' });
FieldAgent.belongsTo(Region, { foreignKey: 'region_id' });

Region.hasMany(Proposal, { foreignKey: 'region_id' });
Proposal.belongsTo(Region, { foreignKey: 'region_id' });

Voter.hasMany(Suggestion, { foreignKey: 'voter_id' });
Suggestion.belongsTo(Voter, { foreignKey: 'voter_id' });
Proposal.hasMany(Suggestion, { foreignKey: 'proposal_id' });
Suggestion.belongsTo(Proposal, { foreignKey: 'proposal_id' });
Region.hasMany(Suggestion, { foreignKey: 'region_id' });

Voter.hasMany(RequestModel, { foreignKey: 'voter_id' });
RequestModel.belongsTo(Voter, { foreignKey: 'voter_id' });
Region.hasMany(RequestModel, { foreignKey: 'region_id' });
RequestModel.belongsTo(Region, { foreignKey: 'region_id' });

FieldAgent.hasMany(Registration, { foreignKey: 'registered_by_agent_id' });
Registration.belongsTo(FieldAgent, { foreignKey: 'registered_by_agent_id' });
Region.hasMany(Registration, { foreignKey: 'region_id' });
Registration.belongsTo(Region, { foreignKey: 'region_id' });

FieldAgent.hasMany(ProductionRecord, { foreignKey: 'agent_id' });
ProductionRecord.belongsTo(FieldAgent, { foreignKey: 'agent_id' });
Region.hasMany(ProductionRecord, { foreignKey: 'region_id' });
ProductionRecord.belongsTo(Region, { foreignKey: 'region_id' });

FieldAgent.hasMany(Goal, { foreignKey: 'agent_id' });
Goal.belongsTo(FieldAgent, { foreignKey: 'agent_id' });
Region.hasMany(Goal, { foreignKey: 'region_id' });
Goal.belongsTo(Region, { foreignKey: 'region_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(WhatsappVerification, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Region,
  Voter,
  FieldAgent,
  Proposal,
  Suggestion,
  RequestModel,
  Registration,
  ProductionRecord,
  Goal,
  Notification,
  WhatsappVerification,
  ConsentRecord,
  AuditLog,
};
