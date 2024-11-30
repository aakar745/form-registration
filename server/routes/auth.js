const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create MFA secret
    const mfaSecret = speakeasy.generateSecret({
      name: `FormRegistration:${email}`
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        mfaSecret: mfaSecret.base32,
        role: 'USER' // Default role
      }
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(mfaSecret.otpauth_url);

    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[Auth Route] Generated token payload:', { userId: user.id, email: user.email });

    res.json({
      success: true,
      token,
      mfaSecret: mfaSecret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('[Auth Route] Login attempt:', req.body.email);
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('[Auth Route] User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[Auth Route] User found:', { id: user.id, role: user.role });

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('[Auth Route] Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if MFA is required
    if (user.requireMFA) {
      console.log('[Auth Route] MFA required for user:', email);
      // Generate temporary token for MFA verification
      const tempToken = jwt.sign(
        { userId: user.id, temp: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({ requireMFA: true, tempToken });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[Auth Route] Generated token payload:', { userId: user.id, email: user.email });

    // Return user data with token
    const { password: _, mfaSecret: __, ...userData } = user;
    console.log('[Auth Route] Login successful. User data:', { 
      id: userData.id, 
      email: userData.email,
      role: userData.role 
    });
    
    res.json({
      success: true,
      token,
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        requireMFA: userData.requireMFA
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify MFA
router.post('/verify-mfa', async (req, res) => {
  try {
    const { token, code } = req.body;

    // Verify temp token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.temp) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verify MFA code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[Auth Route] Generated token payload:', { userId: user.id, email: user.email });

    res.json({ token: newToken });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('[/me] Getting user data for ID:', req.user.userId);
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        requireMFA: true
      }
    });

    if (!user) {
      console.log('[/me] User not found:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[/me] Returning user data:', { 
      id: user.id, 
      email: user.email,
      role: user.role 
    });
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      requireMFA: user.requireMFA
    });
  } catch (error) {
    console.error('[/me] Error getting user data:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update MFA settings
router.post('/mfa/setup', authenticateToken, async (req, res) => {
  try {
    const { enabled } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { requireMFA: enabled }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ error: 'Failed to update MFA settings' });
  }
});

module.exports = router;
