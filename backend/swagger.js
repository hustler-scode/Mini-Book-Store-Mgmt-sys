const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });
const path = require('path');
const fs = require('fs');

const doc = {
  info: {
    title: 'Mini Book Store & Library Management System API',
    description: 'Comprehensive REST API documentation for Mini Book Store & Library Management System. Covers Book Receiving (Donations), Book Purchasing, Take-home Lending, In-Library Reading Sessions, Fines Tracking, and User Authentication.',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and JWT token generation' },
    { name: 'Users', description: 'User & Member management' },
    { name: 'Categories', description: 'Book categories' },
    { name: 'Books', description: 'Books and physical Book Copies' },
    { name: 'Donations', description: 'Feature 1: Book receiving / donation requests and approvals' },
    { name: 'Suppliers', description: 'Supplier management' },
    { name: 'Purchases', description: 'Feature 2: Book purchases and automated inventory addition' },
    { name: 'Lending', description: 'Feature 3: Take-home book borrowing and returns' },
    { name: 'In-Library', description: 'Feature 4: In-library reading sessions and desk tracking' },
    { name: 'Fines', description: 'Overdue fines and payments' },
    { name: 'System', description: 'System health and diagnostics' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Optional JWT Bearer token for testing authenticated requests'
      }
    }
  }
};

const outputFile = path.join(__dirname, 'swagger-output.json');

/**
 * Automatically discovers all route files in src/routes so any new controller or route
 * is immediately included in the Swagger documentation without any manual registration!
 */
const getEndpointFiles = () => {
  const routesDir = path.join(__dirname, 'src', 'routes');
  const files = [];

  if (fs.existsSync(routesDir)) {
    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('.js') && file !== 'index.js')
      .map(file => path.join(routesDir, file));
    files.push(...routeFiles);
  }

  // Also include index.js for health check and general routes
  files.push(path.join(routesDir, 'index.js'));

  return files;
};

const generateSwagger = async () => {
  try {
    const endpointsFiles = getEndpointFiles();
    await swaggerAutogen(outputFile, endpointsFiles, doc);
    console.log('Swagger documentation generated successfully at:', outputFile);
    return true;
  } catch (err) {
    console.error('Error generating Swagger docs:', err.message);
    return false;
  }
};

// If run directly from command line: node swagger.js
if (require.main === module) {
  generateSwagger();
}

module.exports = { generateSwagger, outputFile };
