const mongoose = require('mongoose');
const logger = require('./logger');
require('dotenv').config();

// Set strictQuery to true to suppress deprecation warning
mongoose.set('strictQuery', true);

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Configure Mongoose options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, options);
        
        // Log successful connection
        logger.info('MongoDB Connected Successfully');
        
        // Handle connection events
        mongoose.connection.on('error', err => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                logger.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

    } catch (err) {
        logger.error('MongoDB Connection Error:', err);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
