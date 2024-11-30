const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    assignedPages: {
        type: [String],
        default: []
    },
    mfaSecret: {
        type: String
    },
    requireMFA: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Check password method
userSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Get safe user data (without sensitive info)
userSchema.methods.toSafeObject = function() {
    return {
        id: this._id,
        email: this.email,
        role: this.role,
        assignedPages: this.assignedPages,
        requireMFA: this.requireMFA,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
