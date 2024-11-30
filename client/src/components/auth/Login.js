import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../config/axios';
import { DEFAULT_ADMIN } from '../../config/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    if (token && user) {
      const userData = JSON.parse(user);
      const defaultPath = userData.role === 'admin' ? '/admin/forms' : '/dashboard';
      navigate(defaultPath, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const { email, password } = formData;
      let response;
      
      // Check if it's the admin login
      if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        response = await axios.post('/api/auth/admin/login', formData);
      } else {
        response = await axios.post('/api/auth/login', formData);
      }
      
      const { token, user } = response.data;
      
      // Store auth data
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Get return URL from query params
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get('returnUrl');
      
      // Default paths based on role
      const defaultPath = user.role === 'admin' ? '/admin/forms' : '/dashboard';
      
      // If there's a returnUrl, decode and use it, otherwise use the default path
      const redirectPath = returnUrl ? decodeURIComponent(returnUrl) : defaultPath;
      
      // Navigate to the appropriate path
      navigate(redirectPath, { replace: true });
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
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
        <Box sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </form>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
