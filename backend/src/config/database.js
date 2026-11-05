const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'postgres';

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });
} else if (dialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'minibookstore',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      dialect: 'postgres',
      logging: false
    }
  );
} else {
  // SQLite fallback for standalone testing without active postgres server
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
  });
}

module.exports = sequelize;

