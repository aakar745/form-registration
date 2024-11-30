require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const prisma = require('./db');
const { validate, registerValidation, loginValidation, mfaValidation } = require('./middleware/validation');
const rateLimit = require('express-rate-limit');
const formRoutes = require('./routes/forms');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-MFA-Token'],
  credentials: true
}));
app.use(express.json());

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: { 
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

// Apply rate limiting to login route
app.use('/api/auth/login', loginLimiter);

// API routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Form Registration API',
    version: '1.0.0',
    status: 'Online',
    documentation: {
      endpoints: {
        login: {
          path: '/api/auth/login',
          method: 'POST',
          body: {
            email: 'string (required)',
            password: 'string (required)'
          },
          description: 'Authenticates user and returns JWT token. If MFA is enabled, returns temporary token for MFA verification.',
          responses: {
            success: {
              'without MFA': {
                status: 200,
                body: {
                  token: 'JWT token string'
                }
              },
              'with MFA': {
                status: 200,
                body: {
                  requireMFA: true,
                  tempToken: 'temporary JWT token string'
                }
              }
            },
            errors: {
              400: 'Email and password are required',
              401: 'Invalid credentials',
              500: 'Server error'
            }
          }
        },
        mfaVerify: {
          path: '/api/auth/mfa/verify',
          method: 'POST',
          body: {
            code: 'string (required)',
            tempToken: 'string (required)'
          },
          description: 'Verifies MFA code and returns final JWT token for authenticated session',
          responses: {
            success: {
              status: 200,
              body: {
                token: 'JWT token string'
              }
            },
            errors: {
              400: 'Code and tempToken are required',
              401: ['Invalid token', 'MFA session expired. Please login again.', 'Invalid token type', 'Invalid MFA code'],
              500: 'Server error'
            }
          }
        },
        register: {
          path: '/api/auth/register',
          method: 'POST',
          body: {
            email: 'string (required)',
            password: 'string (required)'
          },
          description: 'Registers a new user and returns a temporary token for MFA setup',
          responses: {
            success: {
              status: 201,
              body: {
                message: 'User registered successfully',
                requireMFA: true,
                mfaSecret: 'string',
                tempToken: 'temporary JWT token string'
              }
            },
            errors: {
              400: ['Email and password are required', 'User already exists'],
              500: 'Error registering user'
            }
          }
        },
        mfaSetup: {
          path: '/api/auth/mfa/setup',
          method: 'POST',
          description: 'Sets up MFA for the user and returns a QR code',
          responses: {
            success: {
              status: 200,
              body: {
                qrCode: 'string',
                secret: 'string'
              }
            },
            errors: {
              500: 'Error setting up MFA'
            }
          }
        },
        mfaEnable: {
          path: '/api/auth/mfa/enable',
          method: 'POST',
          body: {
            token: 'string (required)'
          },
          description: 'Enables MFA for the user',
          responses: {
            success: {
              status: 200,
              body: {
                message: 'MFA enabled successfully'
              }
            },
            errors: {
              400: 'Verification code is required',
              401: 'Invalid verification code',
              500: 'Error enabling MFA'
            }
          }
        },
        forms: {
          getForms: {
            path: '/api/forms',
            method: 'GET',
            description: 'Fetches all forms for the authenticated user',
            responses: {
              success: {
                status: 200,
                body: {
                  forms: 'array of form objects'
                }
              },
              errors: {
                500: 'Error fetching forms'
              }
            }
          },
          createForm: {
            path: '/api/forms',
            method: 'POST',
            body: {
              title: 'string (required)',
              description: 'string',
              schema: 'object (required)',
              settings: 'object'
            },
            description: 'Creates a new form for the authenticated user',
            responses: {
              success: {
                status: 201,
                body: {
                  form: 'newly created form object'
                }
              },
              errors: {
                400: 'Title and schema are required',
                500: 'Error creating form'
              }
            }
          },
          getForm: {
            path: '/api/forms/:id',
            method: 'GET',
            description: 'Fetches a specific form by ID for the authenticated user',
            responses: {
              success: {
                status: 200,
                body: {
                  form: 'form object'
                }
              },
              errors: {
                404: 'Form not found',
                403: 'You do not have permission to view this form',
                500: 'Error fetching form'
              }
            }
          },
          updateForm: {
            path: '/api/forms/:id',
            method: 'PUT',
            body: {
              title: 'string',
              description: 'string',
              schema: 'object',
              settings: 'object'
            },
            description: 'Updates a specific form by ID for the authenticated user',
            responses: {
              success: {
                status: 200,
                body: {
                  message: 'Form updated successfully',
                  form: 'updated form object'
                }
              },
              errors: {
                404: 'Form not found',
                403: 'You do not have permission to edit this form',
                500: 'Error updating form'
              }
            }
          },
          deleteForm: {
            path: '/api/forms/:id',
            method: 'DELETE',
            description: 'Deletes a specific form by ID for the authenticated user',
            responses: {
              success: {
                status: 200,
                body: {
                  message: 'Form deleted successfully'
                }
              },
              errors: {
                404: 'Form not found',
                403: 'You do not have permission to delete this form',
                500: 'Error deleting form'
              }
            }
          }
        }
      },
      authentication: {
        type: 'JWT (JSON Web Token)',
        usage: 'Include the JWT token in the Authorization header for protected routes',
        format: 'Authorization: Bearer <token>'
      },
      note: 'This is a secure API that requires authentication. All data should be sent as JSON in the request body.',
      testAccount: {
        email: 'test@example.com',
        password: 'password123',
        note: 'This account has MFA enabled for testing purposes'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Registration endpoint
app.post('/api/auth/register', registerValidation, validate, async (req, res) => {
  try {
    console.log('Registration request received:', { email: req.body.email, username: req.body.username });
    
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Registration failed: User already exists:', email);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        requireMFA: false,
        mfaSecret: null
      }
    });
    
    console.log('New user registered successfully:', { email, username });
    
    // Generate token for immediate login
    const token = jwt.sign({ email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.'
    });
  }
});

// Login endpoint
app.post('/api/auth/login', loginValidation, validate, async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.requireMFA) {
      // Generate temporary token for MFA
      const tempToken = jwt.sign(
        { email: user.email, requireMFA: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({
        success: true,
        requireMFA: true,
        tempToken
      });
    }

    // Generate final token if no MFA required
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' }); // Increased from 1h to 24h
    console.log('Login successful for:', email);
    
    res.json({
      success: true,
      token,
      user: {
        email: user.email,
        username: user.username,
        requireMFA: user.requireMFA
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.'
    });
  }
});

// MFA verification endpoint
app.post('/api/auth/mfa/verify', mfaValidation, validate, async (req, res) => {
  try {
    const { code, tempToken } = req.body;

    if (!code || !tempToken) {
      return res.status(400).json({ 
        success: false,
        message: 'Code and tempToken are required' 
      });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          success: false,
          message: 'MFA session expired. Please login again.' 
        });
      }
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }

    if (!decoded.requireMFA) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token type' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Verify MFA code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow for some time drift
    });

    if (!verified) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid verification code' 
      });
    }

    // Generate final token
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      success: true,
      token 
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error' 
    });
  }
});

// MFA setup endpoint
app.post('/api/auth/mfa/setup', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new secret
    const secret = speakeasy.generateSecret();
    user.mfaSecret = secret.base32;

    // Generate QR code URL
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: encodeURIComponent(req.user.email),
      issuer: 'FormRegistration',
      encoding: 'ascii'
    });

    await prisma.user.update({
      where: { email: req.user.email },
      data: { mfaSecret: user.mfaSecret }
    });

    res.json({
      success: true,
      qrCode: otpauthUrl,
      secret: user.mfaSecret
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up MFA'
    });
  }
});

// MFA enable endpoint
app.post('/api/auth/mfa/enable', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable MFA
    await prisma.user.update({
      where: { email: req.user.email },
      data: { requireMFA: true }
    });

    res.json({
      success: true,
      message: 'MFA enabled successfully'
    });
  } catch (error) {
    console.error('MFA enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enabling MFA'
    });
  }
});

// Get authenticated user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        email: req.user.email,
        id: user.id,
        requireMFA: user.requireMFA
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking authentication'
    });
  }
});

// Register form routes
app.use('/api/forms', authenticateToken, formRoutes);

// Get user settings endpoint
app.get('/api/user/settings', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        email: req.user.email,
        username: user.username,
        requireMFA: user.requireMFA,
        mfaEnabled: !!user.mfaSecret,
        id: user.id
      }
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user settings'
    });
  }
});

// Update user settings endpoint
app.put('/api/user/settings', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user settings
    if (username) {
      await prisma.user.update({
        where: { email: req.user.email },
        data: { username }
      });
    }

    res.json({
      success: true,
      user: {
        email: req.user.email,
        username: username || user.username,
        requireMFA: user.requireMFA,
        mfaEnabled: !!user.mfaSecret,
        id: user.id
      }
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user settings'
    });
  }
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'user'
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, assignedPages, password } = req.body;

    // Prepare update data
    const updateData = {
      username,
      email,
      role,
      assignedPages
    };

    // Only update password if it's provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        assignedPages: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Update user endpoint
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, assignedPages } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      role,
      assignedPages
    };

    // Only update password if it's provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        assignedPages: updatedUser.assignedPages
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API server running on port ${PORT}`);
});
