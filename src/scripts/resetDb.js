const sequelize = require('../config/database');
const User = require('../models/User');

async function resetDatabase() {
    try {
        // Force sync (this will drop all tables and recreate them)
        await sequelize.sync({ force: true });
        console.log('Database reset complete');

        // Create test user
        await User.create({
            email: 'test@example.com',
            password: 'password123',
            role: 'user'
        });
        console.log('Test user created');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase();
