const { Suggestion, Voter } = require('../models');
const notificationService = require('../services/notificationService');

async function create(req, res) {
  const voter = await Voter.findOne({ where: { user_id: req.user.id } });
  if (!voter) return res.status(403).json({ error: 'Apenas eleitores podem enviar sugestões.' });

  const { title, description, region_id, category, proposal_id, attachment_url } = req.body;

  const suggestion = await Suggestion.create({
    voter_id: voter.id,
    proposal_id: proposal_id || null,
    title,
    description,
    region_id: region_id || voter.region_id,
    category,
    attachment_url: attachment_url || null,
    status: 'recebida',
  });

  return res.status(201).json(suggestion);
}

/** Eleitor só pode ver as próprias sugestões — reforçado no controller além do RBAC */
async function myList(req, res) {
  const voter = await Voter.findOne({ where: { user_id: req.user.id } });
  if (!voter) return res.status(403).json({ error: 'Apenas eleitores podem acessar este recurso.' });

  const suggestions = await Suggestion.findAll({
    where: { voter_id: voter.id },
    order: [['created_at', 'DESC']],
  });
  return res.json(suggestions);
}

// --- Endpoints administrativos ---
async function adminList(req, res) {
  const { status, category, region_id } = req.query;
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (region_id) where.region_id = region_id;

  const suggestions = await Suggestion.findAll({ where, order: [['created_at', 'DESC']] });
  return res.json(suggestions);
}

async function updateStatus(req, res) {
  const { status, admin_response } = req.body;
  const suggestion = await Suggestion.findByPk(req.params.id);
  if (!suggestion) return res.status(404).json({ error: 'Sugestão não encontrada.' });

  suggestion.status = status || suggestion.status;
  if (admin_response) suggestion.admin_response = admin_response;
  await suggestion.save();

  const voter = await Voter.findByPk(suggestion.voter_id);
  if (voter) {
    await notificationService.notify({
      userId: voter.user_id,
      type: 'suggestion_update',
      title: 'Atualização da sua sugestão',
      message: `Sua sugestão "${suggestion.title}" agora está: ${suggestion.status}.`,
      sendWhatsapp: true,
    });
  }

  return res.json(suggestion);
}

module.exports = { create, myList, adminList, updateStatus };
