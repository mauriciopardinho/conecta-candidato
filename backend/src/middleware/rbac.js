/**
 * authorize(...roles) — permite acesso somente se req.user.role estiver
 * entre os perfis passados. Deve ser usado sempre depois de `authenticate`.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso.' });
    }
    next();
  };
}

/**
 * ownershipGuard — para rotas de eleitor/cabo, garante que o parâmetro de
 * dono do recurso (ex.: voter_id, agent_id) corresponde ao usuário
 * autenticado, a menos que seja admin.
 */
function ownershipGuard(profileIdField = 'profileId') {
  return (req, res, next) => {
    if (req.user.role === 'admin') return next(); // admin enxerga tudo
    const requestedId = req.params[profileIdField] || req.query[profileIdField];
    if (requestedId && requestedId !== req.user.profileId) {
      return res.status(403).json({ error: 'Acesso restrito aos seus próprios dados.' });
    }
    next();
  };
}

module.exports = { authorize, ownershipGuard };
