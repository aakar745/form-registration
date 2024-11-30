const sequelize = require('./database');
const { User, Form, FormSubmission } = require('../models');

async function initializeDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');

    // Create admin user if it doesn't exist
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // Remember to change this in production
        role: 'admin'
      });
      console.log('Admin user created successfully.');
    }

  } catch (error) {
    console.error('Unable to initialize database:', error);
    process.exit(1);
  }
}

module.exports = initializeDatabase;
