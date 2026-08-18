const { RequestModel, Voter } = require('../models');
const notificationService = require('../services/notificationService');

async function create(req, res) {
  const voter = await Voter.findOne({ where: { user_id: req.user.id } });
  if (!voter) return res.status(403).json({ error: 'Apenas eleitores podem enviar solicitações.' });

  const { region_id, subject, description, priority, photo_url } = req.body;

  const request = await RequestModel.create({
    voter_id: voter.id,
    region_id: region_id || voter.region_id,
    subject,
    description,
    priority: priority || 'media',
    photo_url: photo_url || null,
    status: 'recebida',
  });

  return res.status(201).json(request);
}

async function myList(req, res) {
  const voter = await Voter.findOne({ where: { user_id: req.user.id } });
  if (!voter) return res.status(403).json({ error: 'Apenas eleitores podem acessar este recurso.' });

  const requests = await RequestModel.findAll({
    where: { voter_id: voter.id },
    order: [['created_at', 'DESC']],
  });
  return res.json(requests);
}

// --- Endpoints administrativos ---
// Nota: dados pessoais do solicitante não são expostos publicamente; este
// endpoint é protegido por authenticate + authorize('admin').
async function adminList(req, res) {
  const { status, priority, region_id } = req.query;
  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (region_id) where.region_id = region_id;

  const requests = await RequestModel.findAll({ where, order: [['created_at', 'DESC']] });
  return res.json(requests);
}

async function updateStatus(req, res) {
  const { status } = req.body;
  const request = await RequestModel.findByPk(req.params.id);
  if (!request) return res.status(404).json({ error: 'Solicitação não encontrada.' });

  request.status = status;
  await request.save();

  const voter = await Voter.findByPk(request.voter_id);
  if (voter) {
    await notificationService.notify({
      userId: voter.user_id,
      type: 'request_update',
      title: 'Atualização da sua solicitação',
      message: `Sua solicitação "${request.subject}" agora está: ${request.status}.`,
      sendWhatsapp: true,
    });
  }

  return res.json(request);
}

module.exports = { create, myList, adminList, updateStatus };
