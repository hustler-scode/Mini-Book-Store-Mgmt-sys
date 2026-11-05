const { Client } = require('pg');
require('dotenv').config();

/**
 * Ensures that the target PostgreSQL database exists.
 * If it doesn't, connects to the default 'postgres' database and creates it automatically.
 */
const ensureDatabaseExists = async () => {
  const dialect = process.env.DB_DIALECT || 'postgres';
  if (dialect === 'sqlite') {
    return;
  }

  const dbName = process.env.DB_NAME || 'minibookstore';
  const clientConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: 'postgres' // default maintenance DB
      };

  // If using connection string, point it to postgres database for creation check
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      url.pathname = '/postgres';
      clientConfig.connectionString = url.toString();
    } catch (e) {
      // fallback to original
    }
  }

  const client = new Client(clientConfig);

  try {
    await client.connect();
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const res = await client.query(checkDbQuery, [dbName]);

    if (res.rowCount === 0) {
      console.log(`PostgreSQL database "${dbName}" does not exist. Creating it automatically...`);
      // Database names cannot be parameterized in CREATE DATABASE, escape quotes
      const safeDbName = dbName.replace(/"/g, '""');
      await client.query(`CREATE DATABASE "${safeDbName}"`);
      console.log(`Database "${dbName}" created successfully!`);
    }
  } catch (err) {
    console.warn(`Auto database creation check note: ${err.message}`);
  } finally {
    await client.end().catch(() => {});
  }
};

module.exports = ensureDatabaseExists;

