import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';

export default function MFASetup({ onSetupComplete, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupStarted, setSetupStarted] = useState(false);

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/mfa/setup');
      setQrCode(response.data.qrCode);
      setSetupStarted(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Error setting up MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await axios.post('/api/auth/mfa/enable', {
        token: verificationCode
      });

      setSuccess(true);
      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error verifying MFA code');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (success) {
    return (
      <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          MFA has been successfully enabled for your account!
        </Alert>
        <Typography>
          You will now be required to enter a verification code when logging in.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Setup Two-Factor Authentication
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!setupStarted ? (
        <Box>
          <Typography paragraph>
            Two-factor authentication adds an extra layer of security to your account.
            Once enabled, you'll need to enter a verification code from your
            authenticator app when logging in.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleStartSetup}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Start Setup'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleVerify}>
          <Typography paragraph>
            1. Install an authenticator app like Google Authenticator or Authy
          </Typography>
          
          <Typography paragraph>
            2. Scan this QR code with your authenticator app:
          </Typography>
          
          {qrCode && (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%' }} />
            </Box>
          )}
          
          <Typography paragraph>
            3. Enter the verification code from your authenticator app:
          </Typography>
          
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            margin="normal"
            disabled={loading}
            required
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !verificationCode}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify and Enable'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
