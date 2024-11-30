const express = require('express');
const { Form, FormSubmission } = require('../models');
const { APIError } = require('../utils/errorHandler');

const router = express.Router();

// Create a new form
router.post('/', async (req, res, next) => {
    try {
        const formData = {
            title: req.body.settings?.title || 'Untitled Form',
            description: req.body.settings?.description || '',
            elements: req.body.elements || [],
            settings: req.body.settings || {},
            status: req.body.status || 'draft',
            createdBy: 'temp-user'
        };

        const form = await Form.create(formData);
        res.status(201).json(form);
    } catch (error) {
        console.error('Error creating form:', error);
        next(error);
    }
});

// Get all forms for current user
router.get('/', async (req, res, next) => {
    try {
        const forms = await Form.find()
            .sort({ createdAt: -1 });
        res.json(forms);
    } catch (error) {
        next(error);
    }
});

// Get a specific form
router.get('/:id', async (req, res, next) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            throw new APIError('Form not found', 404);
        }
        res.json(form);
    } catch (error) {
        next(error);
    }
});

// Update a form
router.patch('/:id', async (req, res, next) => {
    try {
        console.log('Update request received:', req.body);

        const formData = {
            title: req.body.title || 'Untitled Form',
            description: req.body.description || '',
            elements: req.body.elements || [],
            status: req.body.status || 'draft'
        };

        console.log('Processed form data:', formData);

        const form = await Form.findByIdAndUpdate(
            req.params.id,
            { $set: formData },
            { new: true, runValidators: true }
        );

        if (!form) {
            throw new APIError('Form not found', 404);
        }

        res.json(form);
    } catch (error) {
        console.error('Error updating form:', error);
        next(error);
    }
});

// Delete a form
router.delete('/:id', async (req, res, next) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            throw new APIError('Form not found', 404);
        }

        // Delete all submissions for this form
        await FormSubmission.deleteMany({ formId: req.params.id });

        await Form.findByIdAndDelete(req.params.id);

        res.json({ message: 'Form deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Submit a form
router.post('/:id/submit', async (req, res, next) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            throw new APIError('Form not found', 404);
        }

        const submission = await FormSubmission.create({
            formId: form._id,
            submittedBy: 'anonymous', // Temporary anonymous submission
            data: req.body.data,
            metadata: {
                userAgent: req.get('user-agent'),
                ipAddress: req.ip,
                submissionTime: new Date()
            }
        });

        res.status(201).json(submission);
    } catch (error) {
        next(error);
    }
});

// Get form submissions
router.get('/:id/submissions', async (req, res, next) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            throw new APIError('Form not found', 404);
        }

        const submissions = await FormSubmission.find({ formId: form._id })
            .sort({ createdAt: -1 });

        res.json(submissions);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
