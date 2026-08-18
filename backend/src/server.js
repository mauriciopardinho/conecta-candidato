const app = require('./app');
const { sequelize, User } = require('./models');
const logger = require('./utils/logger');
const runSeed = require('./seed/seed');

const PORT = process.env.PORT || 3333;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info('Conexão com o banco de dados estabelecida e sincronizada.');

    // Auto-seed automático caso o banco esteja limpo/vazio (ex: no Render)
    const userCount = await User.count();
    if (userCount === 0) {
      logger.info('Banco de dados inicializado sem usuários. Executando auto-seed das RAs do DF...');
      await runSeed();
    }

    app.listen(PORT, () => {
      logger.info(`Conecta Candidato API rodando na porta ${PORT}`);
    });
  } catch (err) {
    logger.error('Falha ao iniciar o servidor:', err.message);
    process.exit(1);
  }
}

start();
