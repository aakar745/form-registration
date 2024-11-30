import React, { useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import MFASetup from '../components/MFASetup';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);

  // Initialize state from user data
  useEffect(() => {
    if (user) {
      setMfaEnabled(user.mfaEnabled || false);
    }
  }, [user]);

  // Fetch user settings
  const fetchUserSettings = useCallback(async () => {
    if (!user) return; // Don't fetch if no user
    
    try {
      setLoading(true);
      const response = await axios.get('/api/user/settings');
      
      if (response.data) {
        setMfaEnabled(response.data.mfaEnabled || false);
        // Only update user context if MFA status is different
        if (user.mfaEnabled !== response.data.mfaEnabled && updateUser) {
          updateUser({ ...user, mfaEnabled: response.data.mfaEnabled });
        }
      }
      
      setError(null);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError(error.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user, updateUser]);

  // Only fetch settings once when component mounts
  useEffect(() => {
    fetchUserSettings();
  }, []);  // Remove fetchUserSettings from dependencies

  // Handle MFA toggle
  const handleMFAToggle = async (event) => {
    event.preventDefault();
    const newState = !mfaEnabled;

    if (newState) {
      // Show MFA setup when enabling
      setShowMFASetup(true);
    } else {
      // Disable MFA
      try {
        setActionLoading(true);
        setError(null);
        
        const response = await axios.post('/api/auth/mfa/disable');
        
        if (response.data) {
          setMfaEnabled(false);
          if (updateUser) {
            updateUser({ ...user, mfaEnabled: false });
          }
          setSuccess('Two-factor authentication has been disabled');
        }
      } catch (error) {
        console.error('Failed to disable MFA:', error);
        setError(error.response?.data?.error || 'Failed to disable MFA');
        // Revert the toggle if there was an error
        setMfaEnabled(true);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Handle MFA setup completion
  const handleSetupComplete = async () => {
    try {
      await fetchUserSettings();
      setShowMFASetup(false);
      setSuccess('Two-factor authentication has been enabled');
    } catch (error) {
      console.error('Failed to refresh settings after MFA setup:', error);
      setError('MFA was enabled but failed to refresh settings. Please refresh the page.');
    }
  };

  // Handle MFA setup cancellation
  const handleSetupCancel = () => {
    setShowMFASetup(false);
    // Ensure the toggle reflects the current state
    setMfaEnabled(user?.mfaEnabled || false);
  };

  // Handle closing alerts
  const handleCloseError = () => setError(null);
  const handleCloseSuccess = () => setSuccess(null);

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={mfaEnabled}
              onChange={handleMFAToggle}
              color="primary"
              disabled={actionLoading}
            />
          }
          label={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              Two-Factor Authentication (2FA)
              {actionLoading && (
                <CircularProgress size={16} sx={{ ml: 1 }} />
              )}
            </Box>
          }
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {mfaEnabled 
            ? 'Two-factor authentication is enabled. This adds an extra layer of security to your account.'
            : 'Enable two-factor authentication to add an extra layer of security to your account.'}
        </Typography>
      </Paper>

      {showMFASetup && !mfaEnabled && (
        <MFASetup 
          onSetupComplete={handleSetupComplete}
          onCancel={handleSetupCancel}
        />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        message={error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        message={success}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
