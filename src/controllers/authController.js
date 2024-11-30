const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');
const { APIError } = require('../utils/errorHandler');

// Helper function to generate JWT token
const generateToken = (user, expiresIn = '24h') => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn }
    );
};

// Helper function to generate temporary token for MFA
const generateTempToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            requireMFA: true
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '5m' }
    );
};

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new APIError('Validation Error', 400, errors.array());
        }

        const { email, password, role = 'user' } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new APIError('User already exists', 400);
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            email,
            password: hashedPassword,
            role
        });

        logger.info(`New user registered: ${email}`);
        const token = generateToken(user);
        res.status(201).json({ token });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new APIError('Validation Error', 400, errors.array());
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new APIError('Invalid credentials', 401);
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new APIError('Invalid credentials', 401);
        }

        if (user.mfaEnabled) {
            const tempToken = generateTempToken(user);
            return res.json({ requireMFA: true, tempToken });
        }

        const token = generateToken(user);
        logger.info(`User logged in: ${email}`);
        res.json({ token, user: user.toSafeObject() });
    } catch (error) {
        next(error);
    }
};

exports.setupMFA = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new APIError('User not found', 404);
        }

        const secret = speakeasy.generateSecret({
            name: `FormRegistration:${user.email}`
        });

        // Store secret temporarily (should be stored encrypted in production)
        user.mfaSecret = secret.base32;
        await user.save();

        // Generate QR code
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        logger.info(`MFA setup initiated for user: ${req.user.email}`);
        res.json({ qrCode });
    } catch (error) {
        next(error);
    }
};

exports.enableMFA = async (req, res, next) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.mfaSecret) {
            throw new APIError('MFA not setup', 400);
        }

        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token
        });

        if (!verified) {
            throw new APIError('Invalid verification code', 400);
        }

        // Enable MFA
        user.mfaEnabled = true;
        await user.save();

        logger.info(`MFA enabled for user: ${user.email}`);
        res.json({ message: 'MFA enabled successfully' });
    } catch (error) {
        next(error);
    }
};

exports.verifyMFA = async (req, res, next) => {
    try {
        const { token, tempToken } = req.body;

        // Verify temp token
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'your-secret-key');
        if (!decoded.requireMFA) {
            throw new APIError('Invalid token', 400);
        }

        const user = await User.findById(decoded.id);
        if (!user || !user.mfaEnabled || !user.mfaSecret) {
            throw new APIError('MFA not setup', 400);
        }

        // Verify MFA token
        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token
        });

        if (!verified) {
            throw new APIError('Invalid verification code', 400);
        }

        // Generate new token
        const newToken = generateToken(user);

        logger.info(`MFA verified for user: ${user.email}`);
        res.json({ token: newToken });
    } catch (error) {
        next(error);
    }
};

exports.disableMFA = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            throw new APIError('User not found', 404);
        }

        // Disable MFA
        user.mfaEnabled = false;
        user.mfaSecret = null;
        await user.save();

        logger.info(`MFA disabled for user: ${user.email}`);
        res.json({
            message: 'MFA disabled successfully',
            user: user.toSafeObject()
        });
    } catch (error) {
        logger.error(`Error disabling MFA for user ${req.user.email}:`, error);
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        logger.info(`Profile accessed by user: ${req.user.email}`);
        res.json(req.user.toSafeObject());
    } catch (error) {
        next(error);
    }
};

exports.getSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new APIError('User not found', 404);
        }

        const settings = user.toSafeObject();
        logger.info(`Settings accessed by user: ${user.email}`);

        res.json({
            ...settings,
            mfaEnabled: user.mfaEnabled // Ensure MFA status is included
        });
    } catch (error) {
        logger.error(`Error accessing settings for user ${req.user.email}:`, error);
        next(error);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            throw new APIError('User not found', 404);
        }

        await user.update({ role });
        logger.info(`Role updated for user ${user.email} to ${role} by ${req.user.email}`);
        res.json(user.toSafeObject());
    } catch (error) {
        next(error);
    }
};
