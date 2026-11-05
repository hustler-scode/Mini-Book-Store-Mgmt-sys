require('dotenv').config();
const { sequelize, seedDefaults } = require('./src/models');
const seedSampleData = require('./src/seeders/seedSampleData');
const ensureDatabaseExists = require('./src/config/ensureDatabase');
const { generateSwagger } = require('./swagger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Automatically generate/update Swagger spec so any new controller or endpoint is picked up immediately!
    console.log('Generating latest Swagger documentation...');
    await generateSwagger();

    // Load Express app after Swagger docs are generated
    const app = require('./src/app');

    // 2. Connect to Database (PostgreSQL by default)
    console.log('Connecting to database...');
    try {
      // Auto-create database if it does not exist yet in PostgreSQL
      await ensureDatabaseExists();

      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // Auto-sync schema (safe for both PostgreSQL and SQLite)
      const isSqlite = (process.env.DB_DIALECT || 'postgres') === 'sqlite';
      await sequelize.sync(isSqlite ? {} : { alter: true });
      console.log('Database models synchronized.');

      // Seed initial defaults and comprehensive sample data across all tables
      await seedDefaults();
      await seedSampleData();
    } catch (dbError) {
      console.error('\nDatabase Connection Warning:');
      console.error(dbError.message);
      console.log('Please check your PostgreSQL settings in backend/.env:');
      console.log('  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
      console.log('(Tip: Set DB_DIALECT=sqlite in .env for instant local zero-configuration testing)\n');
    }

    // 3. Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger UI is available at: http://localhost:${PORT}/api-docs`);
      console.log(`System health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

