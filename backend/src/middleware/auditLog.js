const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * registerAudit(action, entity) — cria uma entrada em audit_logs. Uso:
 * router.post('/x', authenticate, registerAudit('CREATE_X', 'X'), controller.create)
 * Deve vir DEPOIS de authenticate. Não bloqueia a requisição em caso de
 * falha de log (loga o erro mas segue o fluxo).
 */
function registerAudit(action, entity) {
  return async (req, res, next) => {
    try {
      await AuditLog.create({
        actor_user_id: req.user?.id || null,
        actor_role: req.user?.role || null,
        action,
        entity: entity || null,
        entity_id: req.params?.id || null,
        ip_address: req.ip,
        metadata: JSON.stringify({ path: req.originalUrl, method: req.method }),
      });
    } catch (err) {
      logger.error('Falha ao registrar log de auditoria:', err.message);
    }
    next();
  };
}

module.exports = { registerAudit };
