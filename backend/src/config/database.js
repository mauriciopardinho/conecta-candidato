require('dotenv').config();
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';

let sequelize;

if (databaseUrl.startsWith('sqlite:')) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: databaseUrl.replace('sqlite:', '') || './database.sqlite',
    logging: false,
  });
} else {
  // Postgres/MySQL em produção — basta apontar DATABASE_URL no .env
  sequelize = new Sequelize(databaseUrl, {
    dialect: databaseUrl.startsWith('postgres') ? 'postgres' : 'mysql',
    logging: false,
    dialectOptions:
      process.env.NODE_ENV === 'production'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
  });
}

module.exports = sequelize;
