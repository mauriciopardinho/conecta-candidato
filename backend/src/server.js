const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3333;

async function start() {
  try {
    await sequelize.authenticate();
    // Em produção, prefira migrations reais (sequelize-cli). Para
    // desenvolvimento local, sync() já cria as tabelas automaticamente.
    await sequelize.sync();
    logger.info('Conexão com o banco de dados estabelecida e sincronizada.');

    app.listen(PORT, () => {
      logger.info(`Conecta Candidato API rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Falha ao iniciar o servidor:', err.message);
    process.exit(1);
  }
}

start();
