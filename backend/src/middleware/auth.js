const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'conecta-candidato-secret-key-df-2026';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não informado.' });
  }
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, role, profileId }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = { authenticate, JWT_SECRET };
