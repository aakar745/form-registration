const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

// Get public form by ID
router.get('/public/:formId', async (req, res) => {
    try {
        console.log('Looking for form with ID:', req.params.formId);
        const form = await Form.findById(req.params.formId);
        
        if (!form) {
            console.log('Form not found in database');
            return res.status(404).json({ 
                message: 'Form not found',
                requestedId: req.params.formId
            });
        }

        console.log('Form found:', form.settings?.title);
        res.json(form);
    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({ 
            message: 'Error fetching form',
            error: error.message
        });
    }
});

// Submit form response
router.post('/:formId/submit', async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        form.responses.push({
            data: req.body,
            submittedAt: new Date()
        });

        await form.save();
        
        res.status(201).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ 
            message: 'Error submitting form',
            error: error.message
        });
    }
});

// Get all forms
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all forms');
        const forms = await Form.find();
        console.log(`Found ${forms.length} forms`);
        res.json(forms);
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ 
            message: 'Error fetching forms',
            error: error.message
        });
    }
});

// Create new form
router.post('/', async (req, res) => {
    try {
        const form = new Form({
            ...req.body,
            userId: req.user.id // Assuming user info is added by auth middleware
        });
        
        const savedForm = await form.save();
        res.status(201).json(savedForm);
    } catch (error) {
        console.error('Error creating form:', error);
        res.status(500).json({ 
            message: 'Error creating form',
            error: error.message
        });
    }
});

// Get form by ID (for admin panel)
router.get('/:formId', async (req, res) => {
    try {
        console.log('Looking for form with ID:', req.params.formId);
        const form = await Form.findById(req.params.formId);
        
        if (!form) {
            console.log('Form not found in database');
            return res.status(404).json({ 
                message: 'Form not found',
                requestedId: req.params.formId
            });
        }

        console.log('Form found:', form.settings?.title);
        res.json(form);
    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({ 
            message: 'Error fetching form',
            error: error.message
        });
    }
});

module.exports = router;
