const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    console.log('[Auth] Request URL:', req.originalUrl);
    console.log('[Auth] Request method:', req.method);
    console.log('[Auth] Authenticating request');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('[Auth] No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Auth] Token decoded:', decoded);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      console.log('[Auth] User not found for ID:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('[Auth] User authenticated:', { 
      id: user.id, 
      email: user.email,
      role: user.role,
      url: req.originalUrl 
    });
    
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    console.log('[Auth] Checking admin access for user:', req.user);
    if (!req.user || req.user.role !== 'ADMIN') {
      console.log('[Auth] Admin access denied. User role:', req.user?.role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    console.log('[Auth] Admin access granted');
    next();
  } catch (error) {
    console.error('[Auth] Admin check error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};
