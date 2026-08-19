const { Op, fn, col } = require('sequelize');
const {
  Registration,
  FieldAgent,
  Region,
  RequestModel,
  ProductionRecord,
  User,
  AuditLog,
} = require('../models');
const { hashPassword } = require('../utils/crypto');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** Cards de indicadores principais do dashboard */
async function dashboardSummary(req, res) {
  const [
    totalRegistrations,
    todayRegistrations,
    weekRegistrations,
    monthRegistrations,
    activeAgents,
    regionsCount,
    openRequests,
    completedRequests,
  ] = await Promise.all([
    Registration.count(),
    Registration.count({ where: { registration_date: { [Op.gte]: startOfToday() } } }),
    Registration.count({ where: { registration_date: { [Op.gte]: startOfWeek() } } }),
    Registration.count({ where: { registration_date: { [Op.gte]: startOfMonth() } } }),
    FieldAgent.count({ where: { is_active: true } }),
    Region.count(),
    RequestModel.count({ where: { status: { [Op.notIn]: ['concluida'] } } }),
    RequestModel.count({ where: { status: 'concluida' } }),
  ]);

  const recentActivities = await AuditLog.findAll({
    limit: 8,
    order: [['created_at', 'DESC']],
  });

  const totalRequests = openRequests + completedRequests;
  const resolutionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

  return res.json({
    totalRegistrations,
    todayRegistrations,
    weekRegistrations,
    monthRegistrations,
    activeAgents,
    regionsCount,
    openRequests,
    completedRequests,
    totalRequests,
    resolutionRate,
    recentActivities,
  });
}

/** Série de produção diária agregada (para gráfico) */
async function productionSeries(req, res) {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - Number(days));

  const rows = await ProductionRecord.findAll({
    where: { record_date: { [Op.gte]: since.toISOString().slice(0, 10) } },
    attributes: ['record_date', [fn('SUM', col('registrations_count')), 'total']],
    group: ['record_date'],
    order: [['record_date', 'ASC']],
    raw: true,
  });

  return res.json(rows);
}

/** Tabela de produção por cabo, com filtros */
async function productionByAgent(req, res) {
  const { region_id, status } = req.query;

  const where = {};
  if (region_id) where.region_id = region_id;
  if (status) where.is_active = status === 'ativo';

  const agents = await FieldAgent.findAll({
    where,
    include: [{ model: Region, attributes: ['id', 'name'] }],
  });

  const results = await Promise.all(
    agents.map(async (agent) => {
      const [today, week, month] = await Promise.all([
        Registration.count({ where: { registered_by_agent_id: agent.id, registration_date: { [Op.gte]: startOfToday() } } }),
        Registration.count({ where: { registered_by_agent_id: agent.id, registration_date: { [Op.gte]: startOfWeek() } } }),
        Registration.count({ where: { registered_by_agent_id: agent.id, registration_date: { [Op.gte]: startOfMonth() } } }),
      ]);
      return {
        agent_id: agent.id,
        name: agent.full_name,
        region: agent.Region?.name || null,
        today,
        week,
        month,
        status: agent.is_active ? 'ativo' : 'inativo',
      };
    })
  );

  return res.json(results);
}

/** Dados por região, para o mapa interativo */
async function regionsOverview(req, res) {
  const regions = await Region.findAll({ raw: true });

  const results = await Promise.all(
    regions.map(async (region) => {
      const [registrationsCount, agentsCount, todayProd, weekProd, monthProd, requestsReceived, requestsCompleted] = await Promise.all([
        Registration.count({ where: { region_id: region.id } }),
        FieldAgent.count({ where: { region_id: region.id, is_active: true } }),
        Registration.count({ where: { region_id: region.id, registration_date: { [Op.gte]: startOfToday() } } }),
        Registration.count({ where: { region_id: region.id, registration_date: { [Op.gte]: startOfWeek() } } }),
        Registration.count({ where: { region_id: region.id, registration_date: { [Op.gte]: startOfMonth() } } }),
        RequestModel.count({ where: { region_id: region.id } }),
        RequestModel.count({ where: { region_id: region.id, status: 'concluida' } }),
      ]);

      return {
        ...region,
        registrationsCount,
        agentsCount,
        todayProd,
        weekProd,
        monthProd,
        requestsReceived,
        requestsCompleted,
      };
    })
  );

  return res.json(results);
}

/** Gestão de cabos eleitorais — criação pelo admin */
async function createAgent(req, res) {
  const { name, phone, region_id, username, password } = req.body;

  const existing = await User.findOne({ where: { username } });
  if (existing) return res.status(409).json({ error: 'Nome de usuário já em uso.' });

  const password_hash = await hashPassword(password);

  const user = await User.create({
    role: 'field_agent',
    username,
    phone,
    password_hash,
    status: 'active',
  });

  const agent = await FieldAgent.create({
    user_id: user.id,
    full_name: name,
    region_id: region_id || null,
    is_active: true,
    created_by_admin_id: req.user.id,
  });

  return res.status(201).json({ id: agent.id, name: agent.full_name, username: user.username });
}

async function listAgents(req, res) {
  const agents = await FieldAgent.findAll({ include: [{ model: Region, attributes: ['id', 'name'] }] });
  return res.json(agents);
}

async function updateAgentStatus(req, res) {
  const { is_active } = req.body;
  const agent = await FieldAgent.findByPk(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Cabo eleitoral não encontrado.' });
  agent.is_active = is_active;
  await agent.save();
  return res.json(agent);
}

/** Logs administrativos (auditoria) */
async function listAuditLogs(req, res) {
  const { limit = 100 } = req.query;
  const logs = await AuditLog.findAll({
    order: [['created_at', 'DESC']],
    limit: Number(limit),
  });
  return res.json(logs);
}

module.exports = {
  dashboardSummary,
  productionSeries,
  productionByAgent,
  regionsOverview,
  createAgent,
  listAgents,
  updateAgentStatus,
  listAuditLogs,
};
