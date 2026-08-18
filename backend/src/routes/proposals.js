const express = require('express');
const router = express.Router();

const proposalController = require('../controllers/proposalController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { proposalSchema } = require('../utils/schemas');

// Públicas para qualquer usuário autenticado (eleitor, cabo ou admin)
router.get('/', authenticate, proposalController.list);
router.get('/:id', authenticate, proposalController.getById);

// Administração de propostas
router.post('/', authenticate, authorize('admin'), validate(proposalSchema), proposalController.create);
router.put('/:id', authenticate, authorize('admin'), proposalController.update);

module.exports = router;
