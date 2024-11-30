require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...');
    logger.error(err.name, err.message);
    logger.error(err.stack);
    process.exit(1);
});

// Connect to MongoDB
connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

        // Handle server shutdown
        const gracefulShutdown = () => {
            logger.info('Received shutdown signal. Closing server...');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });
        };

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION! Shutting down...');
            logger.error(err.name, err.message);
            logger.error(err.stack);
            server.close(() => {
                process.exit(1);
            });
        });

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    })
    .catch((err) => {
        logger.error('Database connection failed!');
        logger.error(err);
        process.exit(1);
    });
