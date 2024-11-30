const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, isAdmin);

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalForms,
      totalResponses,
      recentForms,
      recentResponses,
      responsesByDay
    ] = await Promise.all([
      prisma.user.count(),
      prisma.form.count(),
      prisma.formResponse.count(),
      prisma.form.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      }),
      prisma.formResponse.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { form: true }
      }),
      prisma.formResponse.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: { createdAt: 'asc' },
        take: 30
      })
    ]);

    // Calculate total views
    const totalViews = await prisma.form.aggregate({
      _sum: {
        views: true
      }
    });

    res.json({
      totalUsers,
      totalForms,
      totalResponses,
      totalViews: totalViews._sum.views || 0,
      recentForms,
      recentResponses,
      responsesByDay: responsesByDay.map(day => ({
        date: day.createdAt,
        responses: day._count
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get users with pagination and search
router.get('/users', async (req, res) => {
  try {
    const { page = 0, limit = 10, search = '' } = req.query;
    const skip = parseInt(page) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          requireMFA: true,
          _count: {
            select: {
              forms: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Toggle user status (active/inactive)
router.post('/users/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        active: !user.active
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// Get form analytics
router.get('/forms/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const analytics = await prisma.form.groupBy({
      by: ['status'],
      _count: true,
      where
    });

    const responseAnalytics = await prisma.formResponse.groupBy({
      by: ['createdAt'],
      _count: true,
      where,
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      formStats: analytics,
      responseStats: responseAnalytics
    });
  } catch (error) {
    console.error('Error fetching form analytics:', error);
    res.status(500).json({ error: 'Failed to fetch form analytics' });
  }
});

module.exports = router;
