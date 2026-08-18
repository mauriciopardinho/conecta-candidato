require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(generalLimiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ service: 'Conecta Candidato API', status: 'online' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Handler de erros central
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
});

module.exports = app;
