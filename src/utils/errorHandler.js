const mongoose = require('mongoose');

class APIError extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

const handleError = (err) => {
    if (err instanceof APIError) {
        return err;
    }

    // Handle MongoDB Validation Error
    if (err instanceof mongoose.Error.ValidationError) {
        return new APIError(
            'Validation Error',
            400,
            Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        );
    }

    // Handle MongoDB Cast Error (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
        return new APIError(
            'Invalid ID format',
            400
        );
    }

    // Handle MongoDB Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return new APIError(
            `Duplicate value for ${field}`,
            400
        );
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return new APIError('Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return new APIError('Token expired', 401);
    }

    // Default to Internal Server Error
    return new APIError(
        'Internal Server Error',
        500
    );
};

module.exports = {
    APIError,
    handleError
};
