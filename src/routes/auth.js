const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, updateRoleValidation } = require('../validations/auth');
const { APIError } = require('../utils/errorHandler');
const { DEFAULT_ADMIN } = require('../config/auth');

const router = express.Router();

// Authentication routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/admin/login', (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (email !== DEFAULT_ADMIN.email || password !== DEFAULT_ADMIN.password) {
            throw new APIError('Invalid admin credentials', 401);
        }

        const token = jwt.sign(
            { userId: 'admin', role: 'admin' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                _id: 'admin',
                email: DEFAULT_ADMIN.email,
                role: DEFAULT_ADMIN.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// MFA routes
router.post('/mfa/setup', auth, authController.setupMFA);
router.post('/mfa/enable', auth, authController.enableMFA);
router.post('/mfa/verify', authController.verifyMFA);
router.post('/mfa/disable', auth, authController.disableMFA);

// User management routes
router.get('/me', auth, authController.getProfile);
router.get('/settings', auth, authController.getSettings);

// Test endpoint to check user
router.get('/checkuser', async (req, res) => {
    try {
        const user = await User.findOne({ email: 'test@example.com' });
        if (user) {
            res.json({ exists: true, email: user.email });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin routes
router.patch('/role/:userId', auth, requirePermission('users', 'manage'), updateRoleValidation, authController.updateRole);

module.exports = router;
