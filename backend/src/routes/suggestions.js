const express = require('express');
const router = express.Router();

const suggestionController = require('../controllers/suggestionController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { suggestionSchema } = require('../utils/schemas');
const { registerAudit } = require('../middleware/auditLog');

router.post('/', authenticate, authorize('voter'), validate(suggestionSchema), suggestionController.create);
router.get('/my-suggestions', authenticate, authorize('voter'), suggestionController.myList);

// Administração
router.get('/admin', authenticate, authorize('admin'), suggestionController.adminList);
router.patch('/admin/:id', authenticate, authorize('admin'), registerAudit('UPDATE_SUGGESTION', 'Suggestion'), suggestionController.updateStatus);

module.exports = router;
