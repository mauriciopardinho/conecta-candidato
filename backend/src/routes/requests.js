const express = require('express');
const router = express.Router();

const requestController = require('../controllers/requestController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { requestSchema } = require('../utils/schemas');
const { registerAudit } = require('../middleware/auditLog');

router.post('/', authenticate, authorize('voter'), validate(requestSchema), requestController.create);
router.get('/my-requests', authenticate, authorize('voter'), requestController.myList);

// Atendimento por Lideranças de Campo
router.get('/agent', authenticate, authorize('field_agent'), requestController.agentList);
router.patch('/agent/:id', authenticate, authorize('field_agent'), registerAudit('UPDATE_REQUEST_AGENT', 'RequestModel'), requestController.updateStatus);

// Administração Geral
router.get('/admin', authenticate, authorize('admin'), requestController.adminList);
router.patch('/admin/:id', authenticate, authorize('admin'), registerAudit('UPDATE_REQUEST_ADMIN', 'RequestModel'), requestController.updateStatus);

module.exports = router;
