const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const proposalRoutes = require('./proposals');
const suggestionRoutes = require('./suggestions');
const requestRoutes = require('./requests');
const agentRoutes = require('./agent');
const adminRoutes = require('./admin');
const mlRoutes = require('./ml');

const suggestionController = require('../controllers/suggestionController');
const requestController = require('../controllers/requestController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use('/auth', authRoutes);
router.use('/proposals', proposalRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/requests', requestRoutes);
router.use('/agent', agentRoutes);
router.use('/admin', adminRoutes);
router.use('/ml', mlRoutes);

// Aliases de topo, conforme especificação original do produto
router.get('/my-suggestions', authenticate, authorize('voter'), suggestionController.myList);
router.get('/my-requests', authenticate, authorize('voter'), requestController.myList);

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'Conecta Candidato API' }));

module.exports = router;
