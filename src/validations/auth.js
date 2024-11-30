const { body } = require('express-validator');

exports.registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
    body('role')
        .optional()
        .isIn(['user', 'admin', 'manager'])
        .withMessage('Invalid role specified')
];

exports.loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

exports.updateRoleValidation = [
    body('role')
        .isIn(['user', 'admin', 'manager'])
        .withMessage('Invalid role specified')
];
