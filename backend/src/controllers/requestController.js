const { RequestModel, Voter, FieldAgent, Region } = require('../models');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

async function create(req, res) {
  try {
    const voter = await Voter.findOne({ where: { user_id: req.user.id } });
    if (!voter) return res.status(403).json({ error: 'Apenas eleitores podem enviar solicitações.' });

    const { region_id, subject, description, priority, category, photo_url } = req.body;

    const request = await RequestModel.create({
      voter_id: voter.id,
      region_id: region_id || voter.region_id,
      subject,
      description,
      priority: priority || 'media',
      category: category || 'Infraestrutura',
      photo_url: photo_url || null,
      status: 'recebida',
    });

    return res.status(201).json(request);
  } catch (err) {
    logger.error(`Erro ao criar solicitação: ${err.message}`);
    return res.status(500).json({ error: 'Erro ao registrar solicitação.' });
  }
}

async function myList(req, res) {
  try {
    const voter = await Voter.findOne({ where: { user_id: req.user.id } });
    if (!voter) return res.status(403).json({ error: 'Apenas eleitores podem acessar este recurso.' });

    const requests = await RequestModel.findAll({
      where: { voter_id: voter.id },
      include: [{ model: Region, attributes: ['name'] }],
      order: [['created_at', 'DESC']],
    });
    return res.json(requests);
  } catch (err) {
    logger.error(`Erro ao listar solicitações do eleitor: ${err.message}`);
    return res.status(500).json({ error: 'Erro ao listar solicitações.' });
  }
}

// Lista solicitações para o cabo eleitoral da sua Região
async function agentList(req, res) {
  try {
    const agent = await FieldAgent.findOne({ where: { user_id: req.user.id } });
    if (!agent) return res.status(403).json({ error: 'Apenas lideranças de campo podem acessar este recurso.' });

    const requests = await RequestModel.findAll({
      where: { region_id: agent.region_id },
      include: [{ model: Region, attributes: ['name'] }],
      order: [['created_at', 'DESC']],
    });
    return res.json(requests);
  } catch (err) {
    logger.error(`Erro ao listar solicitações do cabo: ${err.message}`);
    return res.status(500).json({ error: 'Erro ao buscar solicitações da região.' });
  }
}

// Endpoints administrativos e de agentes
async function adminList(req, res) {
  try {
    const { status, priority, region_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (region_id) where.region_id = region_id;

    const requests = await RequestModel.findAll({
      where,
      include: [{ model: Region, attributes: ['name'] }],
      order: [['created_at', 'DESC']],
    });
    return res.json(requests);
  } catch (err) {
    logger.error(`Erro ao listar solicitações admin: ${err.message}`);
    return res.status(500).json({ error: 'Erro ao buscar solicitações.' });
  }
}

async function updateStatus(req, res) {
  try {
    const { status, operational_note } = req.body;
    const request = await RequestModel.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Solicitação não encontrada.' });

    request.status = status;
    if (operational_note) {
      request.description = `${request.description}\n\n[Nota Operacional]: ${operational_note}`;
    }
    await request.save();

    const voter = await Voter.findByPk(request.voter_id);
    if (voter) {
      await notificationService.notify({
        userId: voter.user_id,
        type: 'request_update',
        title: 'Atualização da sua solicitação comunitária',
        message: `Sua solicitação "${request.subject}" agora está com status: ${request.status.replace('_', ' ').toUpperCase()}.`,
        sendWhatsapp: true,
      });
    }

    return res.json(request);
  } catch (err) {
    logger.error(`Erro ao atualizar status da solicitação: ${err.message}`);
    return res.status(500).json({ error: 'Erro ao atualizar solicitação.' });
  }
}

module.exports = { create, myList, agentList, adminList, updateStatus };
