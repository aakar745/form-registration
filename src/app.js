const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const formRoutes = require('./routes/forms');
const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Root route - API health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'API is running',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            forms: '/api/forms'
        }
    });
});

// API route - Same health check for /api
app.get('/api', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'API is running',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            forms: '/api/forms'
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/forms', formRoutes);

// 404 handler
app.use((req, res, next) => {
    logger.warn({
        message: 'Route not found',
        method: req.method,
        path: req.path,
        headers: req.headers
    });
    res.status(404).json({ 
        status: 'fail',
        message: 'Route not found'
    });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
