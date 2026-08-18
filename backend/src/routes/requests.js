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

// Administração — dados pessoais do solicitante não expostos publicamente
router.get('/admin', authenticate, authorize('admin'), requestController.adminList);
router.patch('/admin/:id', authenticate, authorize('admin'), registerAudit('UPDATE_REQUEST', 'RequestModel'), requestController.updateStatus);

module.exports = router;
