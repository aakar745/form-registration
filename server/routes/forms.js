const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// Get all forms for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Error fetching forms' });
  }
});

// Get a single form by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check if user owns the form
    if (form.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this form' });
    }

    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Error fetching form' });
  }
});

// Create a new form
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, schema, status } = req.body;
    const form = await prisma.form.create({
      data: {
        title,
        description,
        schema,
        status,
        userId: req.user.id,
        publicUrl: Math.random().toString(36).substring(2, 15),
      },
    });
    res.json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Error creating form' });
  }
});

// Update a form
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, schema, status } = req.body;
    
    // Check if form exists and user owns it
    const existingForm = await prisma.form.findUnique({
      where: { id: req.params.id },
    });

    if (!existingForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (existingForm.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this form' });
    }

    const form = await prisma.form.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        schema,
        status,
      },
    });
    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Error updating form' });
  }
});

// Delete a form
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if form exists and user owns it
    const existingForm = await prisma.form.findUnique({
      where: { id: req.params.id },
    });

    if (!existingForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (existingForm.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this form' });
    }

    await prisma.form.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Error deleting form' });
  }
});

// Get public form by URL
router.get('/public/:publicUrl', async (req, res) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        publicUrl: req.params.publicUrl,
      },
    });

    if (!form || form.status !== 'active') {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    // Increment view count
    await prisma.form.update({
      where: { id: form.id },
      data: { views: { increment: 1 } },
    });

    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Error fetching form' });
  }
});

// Submit form response
router.post('/public/:publicUrl/submit', async (req, res) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        publicUrl: req.params.publicUrl,
      },
    });

    if (!form || form.status !== 'active') {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    const response = await prisma.formResponse.create({
      data: {
        formId: form.id,
        data: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Increment submission count
    await prisma.form.update({
      where: { id: form.id },
      data: { submissions: { increment: 1 } },
    });

    res.json(response);
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Error submitting response' });
  }
});

// Get form responses
router.get('/:formId/responses', authenticateToken, async (req, res) => {
  try {
    const { page = 0, limit = 10 } = req.query;
    const skip = parseInt(page) * parseInt(limit);

    const [responses, total] = await Promise.all([
      prisma.formResponse.findMany({
        where: {
          formId: req.params.formId,
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.formResponse.count({
        where: {
          formId: req.params.formId,
        },
      }),
    ]);

    res.json({
      responses,
      total,
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Error fetching responses' });
  }
});

// Export responses to CSV
router.get('/:formId/responses/export/csv', authenticateToken, async (req, res) => {
  try {
    const responses = await prisma.formResponse.findMany({
      where: {
        formId: req.params.formId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const parser = new Parser();
    const csv = parser.parse(responses.map(r => ({ ...r.data, submittedAt: r.createdAt })));

    res.header('Content-Type', 'text/csv');
    res.attachment('responses.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Error exporting CSV' });
  }
});

// Export responses to PDF
router.get('/:formId/responses/export/pdf', authenticateToken, async (req, res) => {
  try {
    const [form, responses] = await Promise.all([
      prisma.form.findUnique({
        where: { id: req.params.formId },
      }),
      prisma.formResponse.findMany({
        where: { formId: req.params.formId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${form.title}-responses.pdf`);
    doc.pipe(res);

    // Add form title
    doc.fontSize(20).text(form.title, { align: 'center' });
    doc.moveDown();

    // Add responses
    responses.forEach((response, index) => {
      doc.fontSize(14).text(`Response #${index + 1}`);
      doc.fontSize(12).text(`Submitted: ${response.createdAt}`);
      doc.moveDown();
      
      Object.entries(response.data).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
      
      doc.moveDown();
      if (index < responses.length - 1) {
        doc.addPage();
      }
    });

    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Error exporting PDF' });
  }
});

module.exports = router;
