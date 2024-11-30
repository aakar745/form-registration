import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import { toast } from 'react-toastify';
import { handleLogin, handleMfaVerification } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [mfaDialog, setMfaDialog] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await handleLogin(formData);
      console.log('Login response:', data);

      if (data.requireMFA && data.tempToken) {
        setTempToken(data.tempToken);
        setMfaDialog(true);
        toast.info('Please enter your verification code');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        toast.success('Login successful');
        navigate('/dashboard');
        return;
      }

      toast.error('Invalid server response');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleMfaSubmit = async () => {
    if (!mfaCode || !tempToken) {
      toast.error('Please enter a verification code');
      return;
    }

    try {
      const data = await handleMfaVerification(mfaCode, tempToken);

      if (data.token) {
        localStorage.setItem('token', data.token);
        setMfaDialog(false);
        setMfaCode('');
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error('MFA verification failed');
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      toast.error(error.response?.data?.message || 'MFA verification failed');
      setMfaCode('');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box py={4}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>
          <Box mt={2} textAlign="center">
            <Link href="/register" variant="body2">
              Don't have an account? Register
            </Link>
          </Box>
        </Paper>
      </Box>

      <Dialog open={mfaDialog} onClose={() => setMfaDialog(false)}>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Enter the verification code from your authenticator app
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMfaDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMfaSubmit}
            variant="contained"
            color="primary"
            disabled={!mfaCode}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
