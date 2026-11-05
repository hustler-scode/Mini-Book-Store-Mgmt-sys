const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const { authenticateToken } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global Permissive Auth Middleware (populates req.user if JWT is provided, does not block without token)
app.use(authenticateToken);

// Swagger Documentation Setup
const swaggerFilePath = path.join(__dirname, '..', 'swagger-output.json');

const getSwaggerDocument = () => {
  if (fs.existsSync(swaggerFilePath)) {
    try {
      const data = fs.readFileSync(swaggerFilePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.warn('Could not parse swagger-output.json, serving fallback document.');
    }
  }
  return {
    openapi: '3.0.0',
    info: { title: 'Mini Book Store API', version: '1.0.0' },
    paths: {}
  };
};

// Serve Swagger static assets (CSS, JS bundles)
app.use('/api-docs', swaggerUi.serve);

// Serve Swagger UI HTML with dynamically refreshed spec
app.get('/api-docs', (req, res) => {
  const swaggerDoc = getSwaggerDocument();
  const html = swaggerUi.generateHTML(swaggerDoc, {
    customSiteTitle: 'Mini Book Store API Documentation'
  });
  res.send(html);
});

app.use('/docs', (req, res) => res.redirect('/api-docs'));

// Raw Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(getSwaggerDocument());
});

// Mount All API Routes
app.use(routes);

// Welcome redirect to Swagger
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Mini Book Store & Library Management System API',
    swagger_documentation: '/api-docs',
    swagger_json: '/api-docs.json',
    health_check: '/api/health'
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found. Visit /api-docs to see all available endpoints.`
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
