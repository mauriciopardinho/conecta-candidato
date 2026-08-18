const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Voter, FieldAgent, WhatsappVerification, ConsentRecord } = require('../models');
const {
  hashPassword,
  comparePassword,
  generateSixDigitCode,
  hashCode,
  compareCode,
} = require('../utils/crypto');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

function signToken(user, profileId) {
  const secret = process.env.JWT_SECRET || 'conecta-candidato-secret-key-df-2026';
  return jwt.sign(
    { id: user.id, role: user.role, profileId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

/** Cadastro do eleitor — cria user + voter com status ativo diretamente */
async function registerVoter(req, res) {
  try {
    const { name, phone, email, region_id, password, accepted_terms } = req.body;

    if (!accepted_terms) {
      return res.status(400).json({ error: 'É necessário aceitar os termos e a política de privacidade.' });
    }

    const cleanEmail = email && email.trim() ? email.trim() : null;

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ error: 'Já existe uma conta cadastrada com este telefone.' });
    }

    if (cleanEmail) {
      const existingEmail = await User.findOne({ where: { email: cleanEmail } });
      if (existingEmail) {
        return res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail.' });
      }
    }

    const password_hash = await hashPassword(password);

    const user = await User.create({
      role: 'voter',
      phone,
      email: cleanEmail,
      password_hash,
      status: 'active', // Conta ativada diretamente
      terms_accepted_at: new Date(),
    });

    const voter = await Voter.create({
      user_id: user.id,
      full_name: name,
      region_id: region_id || null,
    });

    await ConsentRecord.create({
      subject_type: 'voter',
      subject_id: voter.id,
      consent_type: 'termos_e_privacidade',
      granted_at: new Date(),
      evidence: 'Aceite no formulário de cadastro do app',
    });

    const token = signToken(user, voter.id);

    logger.info(`Novo eleitor cadastrado e ativado diretamente: ${user.phone}`);

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      token,
      user: { id: user.id, role: user.role, status: user.status, profileId: voter.id },
    });
  } catch (err) {
    logger.error(`Erro ao registrar eleitor: ${err.message}`);
    return res.status(400).json({ error: err.message || 'Erro ao realizar cadastro.' });
  }
}

async function sendVerificationCode(user, purpose) {
  const code = generateSixDigitCode();
  const code_hash = await hashCode(code);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);

  await WhatsappVerification.create({
    user_id: user.id,
    phone: user.phone,
    code_hash,
    purpose,
    expires_at,
  });

  if (purpose === 'registration') {
    await whatsappService.sendVerificationCode(user.phone, code);
  } else {
    await whatsappService.sendPasswordResetCode(user.phone, code);
  }
}

/** Confirmação do código enviado via WhatsApp — ativa a conta */
async function verifyWhatsapp(req, res) {
  const { userId, code } = req.body;

  const verification = await WhatsappVerification.findOne({
    where: { user_id: userId, purpose: 'registration', consumed_at: null },
    order: [['created_at', 'DESC']],
  });

  if (!verification) {
    return res.status(400).json({ error: 'Nenhum código pendente encontrado.' });
  }
  if (verification.expires_at < new Date()) {
    return res.status(400).json({ error: 'Código expirado. Solicite um novo.' });
  }
  if (verification.attempts >= 5) {
    return res.status(429).json({ error: 'Número máximo de tentativas excedido.' });
  }

  const valid = await compareCode(code, verification.code_hash);
  if (!valid) {
    verification.attempts += 1;
    await verification.save();
    return res.status(400).json({ error: 'Código inválido.' });
  }

  verification.consumed_at = new Date();
  await verification.save();

  const user = await User.findByPk(userId);
  user.status = 'active';
  await user.save();

  return res.json({ message: 'Conta confirmada com sucesso. Você já pode fazer login.' });
}

/** Login unificado — funciona para voter, field_agent e admin */
async function login(req, res) {
  const { identifier, password } = req.body; // identifier = telefone (eleitor) ou usuário (cabo/admin)

  const user = await User.findOne({
    where: { [Op.or]: [{ phone: identifier }, { username: identifier }, { email: identifier }] },
  });

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  if (user.role === 'voter' && user.status !== 'active') {
    return res.status(403).json({ error: 'Conta ainda não confirmada. Verifique o código enviado por WhatsApp.' });
  }
  if (user.role === 'field_agent') {
    const agent = await FieldAgent.findOne({ where: { user_id: user.id } });
    if (agent && !agent.is_active) {
      return res.status(403).json({ error: 'Seu acesso está inativo. Fale com o administrador.' });
    }
  }
  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Conta bloqueada.' });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  let profileId = null;
  if (user.role === 'voter') {
    const voter = await Voter.findOne({ where: { user_id: user.id } });
    profileId = voter?.id;
  } else if (user.role === 'field_agent') {
    const agent = await FieldAgent.findOne({ where: { user_id: user.id } });
    profileId = agent?.id;
  }

  user.last_login_at = new Date();
  await user.save();

  const token = signToken(user, profileId);

  return res.json({
    token,
    user: { id: user.id, role: user.role, status: user.status, profileId },
  });
}

/** Solicita recuperação de senha (envia código por WhatsApp) */
async function forgotPassword(req, res) {
  const { identifier } = req.body;

  const user = await User.findOne({
    where: { [Op.or]: [{ phone: identifier }, { username: identifier }, { email: identifier }] },
  });

  // Resposta genérica sempre, para não revelar se o identificador existe
  const genericResponse = { message: 'Se o cadastro existir, enviaremos um código por WhatsApp.' };

  if (!user) return res.json(genericResponse);

  await sendVerificationCode(user, 'password_reset');
  return res.json(genericResponse);
}

/** Redefine a senha usando o código recebido */
async function resetPassword(req, res) {
  const { userId, code, newPassword } = req.body;

  const verification = await WhatsappVerification.findOne({
    where: { user_id: userId, purpose: 'password_reset', consumed_at: null },
    order: [['created_at', 'DESC']],
  });

  if (!verification || verification.expires_at < new Date()) {
    return res.status(400).json({ error: 'Código inválido ou expirado.' });
  }

  const valid = await compareCode(code, verification.code_hash);
  if (!valid) {
    verification.attempts += 1;
    await verification.save();
    return res.status(400).json({ error: 'Código inválido.' });
  }

  verification.consumed_at = new Date();
  await verification.save();

  const user = await User.findByPk(userId);
  user.password_hash = await hashPassword(newPassword);
  await user.save();

  logger.info(`Senha redefinida para o usuário ${userId}`);
  return res.json({ message: 'Senha redefinida com sucesso.' });
}

/** Alteração de senha estando autenticado */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  const valid = await comparePassword(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Senha atual incorreta.' });
  }

  user.password_hash = await hashPassword(newPassword);
  await user.save();

  return res.json({ message: 'Senha alterada com sucesso.' });
}

module.exports = {
  registerVoter,
  verifyWhatsapp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};
