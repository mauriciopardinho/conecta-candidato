const express = require('express');
const router = express.Router();

const agentController = require('../controllers/agentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { registrationSchema } = require('../utils/schemas');
const { registerAudit } = require('../middleware/auditLog');

router.post(
  '/registrations',
  authenticate,
  authorize('field_agent'),
  validate(registrationSchema),
  registerAudit('CREATE_REGISTRATION', 'Registration'),
  agentController.createRegistration
);
router.get('/production', authenticate, authorize('field_agent'), agentController.myDashboard);

module.exports = router;
