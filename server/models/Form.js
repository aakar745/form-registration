const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const formSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    settings: {
        type: Object,
        required: true,
        default: {
            title: '',
            description: '',
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
    fields: {
        type: Array,
        required: true,
        default: []
    },
    responses: {
        type: Array,
        default: []
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
formSchema.index({ userId: 1 });
formSchema.index({ '_id': 1, 'isPublished': 1 });

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
