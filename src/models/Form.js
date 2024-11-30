const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        default: 'Untitled Form'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    elements: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    version: {
        type: Number,
        default: 1
    },
    settings: {
        type: Object,
        default: {
            isPublic: false,
            requiresAuth: false,
            title: '',
            description: '',
            theme: 'light',
            header: {
                showLogo: true,
                logoUrl: '',
                brandName: '',
                backgroundColor: '',
                textColor: '',
                navigationLinks: []
            },
            footer: {
                showFooter: true,
                copyrightText: '',
                backgroundColor: '',
                textColor: '',
                links: []
            }
        }
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Add indexes
formSchema.index({ createdBy: 1 });
formSchema.index({ status: 1 });
formSchema.index({ 'settings.isPublic': 1 });

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
