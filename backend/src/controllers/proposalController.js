const { Proposal, Region } = require('../models');

async function list(req, res) {
  const { region_id, category } = req.query;
  const where = { status: 'published' };
  if (region_id) where.region_id = region_id;
  if (category) where.category = category;

  const proposals = await Proposal.findAll({
    where,
    include: [{ model: Region, attributes: ['id', 'name'] }],
    order: [['published_at', 'DESC']],
  });
  return res.json(proposals);
}

async function getById(req, res) {
  const proposal = await Proposal.findByPk(req.params.id, {
    include: [{ model: Region, attributes: ['id', 'name'] }],
  });
  if (!proposal) return res.status(404).json({ error: 'Proposta não encontrada.' });
  return res.json(proposal);
}

// --- Endpoints administrativos de gestão de propostas ---
async function create(req, res) {
  const { title, description, category, image_url, region_id, status } = req.body;
  const proposal = await Proposal.create({
    title,
    description,
    category,
    image_url,
    region_id: region_id || null,
    status: status || 'published',
    published_at: status === 'published' || !status ? new Date() : null,
  });
  return res.status(201).json(proposal);
}

async function update(req, res) {
  const proposal = await Proposal.findByPk(req.params.id);
  if (!proposal) return res.status(404).json({ error: 'Proposta não encontrada.' });
  await proposal.update(req.body);
  return res.json(proposal);
}

module.exports = { list, getById, create, update };
