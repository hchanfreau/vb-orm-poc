const express = require('express');
const setupModule = require('./setup'); // Renamed to setupModule
const eagerLoadingExample = require('./eager-loading-example');
const lazyLoadingExample = require('./lazy-loading-example');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Log the entire module export
console.log('setupModule content after require:', setupModule);
console.log('Type of setupModule after require:', typeof setupModule);
// If it's an object, let's check if it has a 'setupDatabase' property that's a function
if (typeof setupModule === 'object' && typeof setupModule.setupDatabase === 'function') {
  console.log('Found setupDatabase as a property of setupModule!');
}


async function initializeApp() {
  try {
    // Setup database
    // await setupDatabase(); // This was the problematic line
    if (typeof setupModule === 'function') {
      await setupModule();
    } else if (typeof setupModule === 'object' && typeof setupModule.setupDatabase === 'function') {
      await setupModule.setupDatabase();
    } else {
      throw new Error('setupDatabase is not a function or not found in module export.');
    }
    console.log('Database setup complete.');

    // Eager Loading Endpoint
    app.get('/eager-load', async (req, res) => {
      try {
        console.log('--- API Call: /eager-load ---');
        const data = await eagerLoadingExample(sequelize);
        res.json(data);
      } catch (error) {
        console.error('Error handling /eager-load:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    });

    // Lazy Loading Endpoint
    app.get('/lazy-load', async (req, res) => {
      try {
        console.log('--- API Call: /lazy-load ---');
        const data = await lazyLoadingExample(sequelize);
        res.json(data);
      } catch (error) {
        console.error('Error handling /lazy-load:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access Eager Loading: http://localhost:${PORT}/eager-load`);
      console.log(`Access Lazy Loading: http://localhost:${PORT}/lazy-load`);
    });

  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1); // Exit if database setup fails
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing Sequelize connection...');
  if (sequelize) {
    await sequelize.close();
    console.log('Sequelize connection closed.');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing Sequelize connection...');
  if (sequelize) {
    await sequelize.close();
    console.log('Sequelize connection closed.');
  }
  process.exit(0);
});

initializeApp();