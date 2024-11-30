const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { APIError } = require('../utils/errorHandler');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new APIError('No token provided', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if this is a temporary token for MFA verification
        if (decoded.requireMFA) {
            return res.status(401).json({
                status: 'fail',
                message: 'MFA verification required',
                requireMFA: true
            });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new APIError('User not found', 401);
        }

        // Add user to request object
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'fail',
                message: 'Token expired'
            });
        }
        next(error);
    }
};

module.exports = auth;
