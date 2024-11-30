const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const formRoutes = require('./routes/formRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB()
    .then(() => {
        console.log('Connected to MongoDB database');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });

// API Routes
app.use('/api/forms', formRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Form Registration API Server',
        endpoints: {
            forms: '/api/forms',
            publicForm: '/api/forms/public/:formId',
            submitForm: '/api/forms/:formId/submit'
        }
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`,
        availableEndpoints: {
            forms: '/api/forms',
            publicForm: '/api/forms/public/:formId',
            submitForm: '/api/forms/:formId/submit'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}`);
});
