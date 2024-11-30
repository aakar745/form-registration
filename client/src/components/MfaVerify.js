import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';

export default function MfaVerify() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  // Check if MFA token exists on component mount
  useEffect(() => {
    const mfaToken = sessionStorage.getItem('mfaToken');
    if (!mfaToken) {
      setError('MFA session expired. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const tempToken = sessionStorage.getItem('mfaToken');
      if (!tempToken) {
        setError('MFA session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axios.post('/api/auth/mfa/verify', {
        code
      });

      if (response.data.token) {
        // Store the new token and clean up MFA token
        localStorage.setItem('token', response.data.token);
        sessionStorage.removeItem('mfaToken');
        
        // Update authentication state
        await checkAuth();
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      console.error('MFA verification error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to verify MFA code');
      
      if (err.response?.status === 401) {
        setTimeout(() => {
          sessionStorage.removeItem('mfaToken');
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            MFA Verification
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              autoFocus
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
