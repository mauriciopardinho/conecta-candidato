const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em instantes.' },
});

// Limite para rotas de autenticação (ajustado para 100 tentativas em ambiente de dev/testes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Aumentado de 10 para 100 para permitir testes à vontade no ambiente local
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde antes de tentar novamente.' },
});

module.exports = { generalLimiter, authLimiter };
