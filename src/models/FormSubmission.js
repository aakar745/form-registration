const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        browser: String,
        platform: String,
        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
}, {
    timestamps: true
});

// Add indexes for better query performance
formSubmissionSchema.index({ formId: 1, status: 1 });
formSubmissionSchema.index({ submittedBy: 1 });
formSubmissionSchema.index({ 'metadata.submittedAt': -1 });
formSubmissionSchema.index({ status: 1 });

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

module.exports = FormSubmission;
