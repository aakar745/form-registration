const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate MFA secret and QR code
const generateMFASecret = async (username) => {
  const secret = speakeasy.generateSecret({
    name: `FormRegistration:${username}`
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl
  };
};

// Verify MFA token
const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 30 seconds clock skew
  });
};

// Middleware to require MFA if enabled
const requireMFA = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.mfaEnabled) {
    return next();
  }

  const mfaToken = req.header('X-MFA-Token');
  if (!mfaToken) {
    return res.status(401).json({ 
      error: 'MFA token required',
      requiresMFA: true
    });
  }

  const isValid = verifyToken(req.user.mfaSecret, mfaToken);
  if (!isValid) {
    return res.status(401).json({ 
      error: 'Invalid MFA token',
      requiresMFA: true
    });
  }

  next();
};

module.exports = {
  generateMFASecret,
  verifyToken,
  requireMFA
};
