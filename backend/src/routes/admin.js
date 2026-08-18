const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createAgentSchema } = require('../utils/schemas');
const { registerAudit } = require('../middleware/auditLog');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.dashboardSummary);
router.get('/production', adminController.productionSeries);
router.get('/production/by-agent', adminController.productionByAgent);
router.get('/regions', adminController.regionsOverview);
router.get('/agents', adminController.listAgents);
router.post('/agents', validate(createAgentSchema), registerAudit('CREATE_AGENT', 'FieldAgent'), adminController.createAgent);
router.patch('/agents/:id', registerAudit('UPDATE_AGENT', 'FieldAgent'), adminController.updateAgentStatus);
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;
