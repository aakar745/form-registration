const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User } = require('../models');
const { APIError } = require('../utils/errorHandler');

// Get user settings
router.get('/settings', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new APIError('User not found', 404);
        }

        res.json(user.toSafeObject());
    } catch (error) {
        next(error);
    }
});

// Update user settings
router.patch('/settings', auth, async (req, res, next) => {
    try {
        const allowedUpdates = ['name', 'email', 'notificationPreferences', 'theme'];
        const updates = Object.keys(req.body);
        
        // Check if updates are allowed
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            throw new APIError('Invalid updates', 400);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new APIError('User not found', 404);
        }

        // Update user fields
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        res.json(user.toSafeObject());
    } catch (error) {
        next(error);
    }
});

// Delete user account
router.delete('/account', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new APIError('User not found', 404);
        }

        await user.remove();
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
