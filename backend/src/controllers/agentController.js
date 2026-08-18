const { Op, fn, col } = require('sequelize');
const { FieldAgent, Registration, ProductionRecord, Goal, ConsentRecord } = require('../models');

async function getAgentFromUser(userId) {
  return FieldAgent.findOne({ where: { user_id: userId } });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfWeek() {
  const d = startOfToday();
  const day = d.getDay(); // 0 = domingo
  d.setDate(d.getDate() - day);
  return d;
}
function startOfMonth() {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

/** Cadastro de um contato pelo cabo eleitoral — exige consentimento */
async function createRegistration(req, res) {
  const agent = await getAgentFromUser(req.user.id);
  if (!agent) return res.status(403).json({ error: 'Apenas cabos eleitorais podem cadastrar contatos.' });
  if (!agent.is_active) return res.status(403).json({ error: 'Seu acesso está inativo.' });

  const { full_name, phone, region_id, operational_note, has_consent, consent_evidence, source } = req.body;

  if (!has_consent) {
    return res.status(400).json({
      error: 'Não é possível registrar o contato sem base legal/consentimento para o tratamento dos dados.',
    });
  }

  const consent = await ConsentRecord.create({
    subject_type: 'registration',
    subject_id: agent.id, // vinculado após criar o registro, ver abaixo
    consent_type: 'contato_cabo',
    granted_at: new Date(),
    collected_by: agent.id,
    evidence: consent_evidence || 'Consentimento verbal/presencial registrado pelo cabo',
  });

  const registration = await Registration.create({
    full_name,
    phone,
    region_id: region_id || agent.region_id,
    registered_by_agent_id: agent.id,
    registration_date: new Date().toISOString().slice(0, 10),
    operational_note: operational_note || null,
    consent_id: consent.id,
    source: source || null,
  });

  // Atualiza (ou cria) o registro agregado de produção do dia
  const [record, created] = await ProductionRecord.findOrCreate({
    where: {
      agent_id: agent.id,
      region_id: registration.region_id,
      record_date: registration.registration_date,
    },
    defaults: { registrations_count: 1 },
  });
  if (!created) {
    record.registrations_count += 1;
    await record.save();
  }

  return res.status(201).json(registration);
}

/** Dashboard de produção do próprio cabo */
async function myDashboard(req, res) {
  const agent = await getAgentFromUser(req.user.id);
  if (!agent) return res.status(403).json({ error: 'Apenas cabos eleitorais podem acessar este recurso.' });

  const [today, week, month, total, history, goal] = await Promise.all([
    Registration.count({ where: { registered_by_agent_id: agent.id, registration_date: { [Op.gte]: startOfToday().toISOString().slice(0, 10) } } }),
    Registration.count({ where: { registered_by_agent_id: agent.id, registration_date: { [Op.gte]: startOfWeek().toISOString().slice(0, 10) } } }),
    Registration.count({ where: { registered_by_agent_id: agent.id, registration_date: { [Op.gte]: startOfMonth().toISOString().slice(0, 10) } } }),
    Registration.count({ where: { registered_by_agent_id: agent.id } }),
    ProductionRecord.findAll({
      where: { agent_id: agent.id },
      attributes: ['record_date', [fn('SUM', col('registrations_count')), 'total']],
      group: ['record_date'],
      order: [['record_date', 'ASC']],
      raw: true,
    }),
    Goal.findOne({
      where: { agent_id: agent.id, period_end: { [Op.gte]: new Date().toISOString().slice(0, 10) } },
      order: [['period_end', 'ASC']],
    }),
  ]);

  return res.json({
    agent: { id: agent.id, name: agent.full_name, region_id: agent.region_id },
    production: { today, week, month, total },
    history,
    currentGoal: goal,
  });
}

module.exports = { createRegistration, myDashboard };
