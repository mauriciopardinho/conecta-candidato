const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerVoterSchema,
  verifyWhatsappSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../utils/schemas');

router.post('/register', authLimiter, validate(registerVoterSchema), authController.registerVoter);
router.post('/verify-whatsapp', authLimiter, validate(verifyWhatsappSchema), authController.verifyWhatsapp);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
