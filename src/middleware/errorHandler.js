const logger = require('../config/logger');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { APIError } = require('../utils/errorHandler');

// Validation middleware using express-validator
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                errors: errors.array()
            });
        }
        next();
    };
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    logger.error('Error occurred:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Handle APIError instances
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errors: err.errors
        });
    }

    // MongoDB Validation Error
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // MongoDB Cast Error (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid ID format',
            error: err.message
        });
    }

    // MongoDB Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            status: 'fail',
            message: `Duplicate ${field}. This ${field} is already in use.`
        });
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token. Please log in again.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Your token has expired. Please log in again.'
        });
    }

    // Default to 500 server error
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong on our end. Please try again later.'
    });
};

module.exports = {
    validate,
    errorHandler
};
