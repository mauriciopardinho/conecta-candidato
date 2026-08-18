const express = require('express');
const router = express.Router();

const mlController = require('../controllers/mlController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Somente admin acessa o módulo de ML — sempre dados agregados e operacionais
router.use(authenticate, authorize('admin'));

router.get('/forecast', mlController.forecast);
router.get('/anomalies', mlController.anomalies);
router.get('/demand', mlController.demand);

module.exports = router;
