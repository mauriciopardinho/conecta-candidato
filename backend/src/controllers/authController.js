const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Voter, FieldAgent, WhatsappVerification, ConsentRecord, RequestModel, Suggestion, AuditLog } = require('../models');
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
  try {
    const { identifier, password } = req.body; // identifier = telefone (eleitor) ou usuário (cabo/admin)

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Informe o usuário/telefone e a senha.' });
    }

    const cleanIdentifier = String(identifier).trim();

    const user = await User.findOne({
      where: { [Op.or]: [{ phone: cleanIdentifier }, { username: cleanIdentifier }, { email: cleanIdentifier }] },
    });

    if (!user) {
      logger.warn(`Tentativa de login falhou: usuário/identificador não encontrado (${cleanIdentifier})`);
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
      logger.warn(`Tentativa de login falhou: senha incorreta para o usuário ${user.username || user.phone}`);
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

    logger.info(`Login efetuado com sucesso: ${user.username || user.phone} (role: ${user.role})`);

    return res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, status: user.status, profileId },
    });
  } catch (err) {
    logger.error(`Erro crítico durante autenticação de login: ${err.message}`, { stack: err.stack });
    return res.status(500).json({ error: 'Erro interno ao realizar login. Tente novamente em instantes.' });
  }
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
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }

    user.password_hash = await hashPassword(newPassword);
    await user.save();

    return res.json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    logger.error(`Erro ao alterar senha: ${err.message}`);
    return res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
}

/** Exportação de dados do titular (LGPD Art. 18 - Portabilidade) */
async function exportVoterData(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const voter = await Voter.findOne({ where: { user_id: user.id } });
    const consents = voter
      ? await ConsentRecord.findAll({ where: { subject_type: 'voter', subject_id: voter.id } })
      : [];
    const requests = voter
      ? await RequestModel.findAll({ where: { voter_id: voter.id } })
      : [];
    const suggestions = voter
      ? await Suggestion.findAll({ where: { voter_id: voter.id } })
      : [];

    return res.json({
      export_date: new Date().toISOString(),
      lgpd_compliance: 'LGPD Art. 18 - Direito de Acesso e Portabilidade',
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      },
      profile: voter,
      consents,
      requests,
      suggestions,
    });
  } catch (err) {
    logger.error(`Erro ao exportar dados LGPD: ${err.message}`);
    return res.status(500).json({ error: 'Erro ao gerar exportação de dados.' });
  }
}

/** Exclusão/Anonimização da conta do eleitor (LGPD Art. 18 - Eliminação) */
async function deleteVoterAccount(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const voter = await Voter.findOne({ where: { user_id: user.id } });

    user.phone = `+55 (00) 00000-0000_ANON_${user.id.slice(0, 6)}`;
    user.email = `anon_${user.id.slice(0, 6)}@lgpd.local`;
    user.username = null;
    user.status = 'blocked';
    await user.save();

    if (voter) {
      voter.full_name = 'Titular Anonimizado (LGPD)';
      await voter.save();
    }

    await AuditLog.create({
      actor_role: user.role,
      action: 'EXCLUSAO_ANONIMIZACAO_CONTA',
      entity: 'User',
      ip_address: req.ip || '127.0.0.1',
      metadata: JSON.stringify({ userId: user.id, motivo: 'Solicitação de eliminação de dados LGPD pelo titular' }),
    });

    return res.json({ message: 'Sua conta e seus dados pessoais foram anonimizados com sucesso conforme a LGPD.' });
  } catch (err) {
    logger.error(`Erro ao anonimizar conta LGPD: ${err.message}`);
    return res.status(500).json({ error: 'Erro ao processar exclusão de conta.' });
  }
}

module.exports = {
  registerVoter,
  verifyWhatsapp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  exportVoterData,
  deleteVoterAccount,
};
