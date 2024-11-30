import React, { useState, useEffect } from 'react';
import { Box, Button, Switch, Typography, Dialog, DialogContent, DialogActions, TextField, CircularProgress } from '@mui/material';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';
import axios from '../config/axios';

const TwoFactorAuth = ({ user, onUpdate }) => {
    const [open, setOpen] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isEnabling, setIsEnabling] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);

    useEffect(() => {
        setMfaEnabled(user?.mfaEnabled || false);
    }, [user?.mfaEnabled]);

    const handleToggle = async () => {
        try {
            setLoading(true);
            if (!mfaEnabled) {
                // Start MFA setup process
                const response = await axios.post('/api/auth/mfa/setup');
                setQrCode(response.data.qrCode);
                setIsEnabling(true);
                setOpen(true);
            } else {
                // Disable MFA
                await axios.post('/api/auth/mfa/disable');
                setMfaEnabled(false);
                toast.success('Two-factor authentication has been disabled');
                onUpdate();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to toggle 2FA');
            // Reset the toggle if there's an error
            setMfaEnabled(!mfaEnabled);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!verificationCode) {
            toast.error('Please enter verification code');
            return;
        }

        try {
            setLoading(true);
            await axios.post('/api/auth/mfa/enable', {
                token: verificationCode
            });
            setOpen(false);
            setVerificationCode('');
            setIsEnabling(false);
            setMfaEnabled(true);
            toast.success('Two-factor authentication has been enabled');
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid verification code');
            // Reset enabling state if verification fails
            setIsEnabling(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setOpen(false);
        setVerificationCode('');
        setIsEnabling(false);
        // Reset MFA state if setup is cancelled
        setMfaEnabled(false);
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                    <Typography variant="h6">Two-Factor Authentication</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Add an extra layer of security to your account
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    {loading && <CircularProgress size={20} sx={{ mr: 2 }} />}
                    <Switch
                        checked={mfaEnabled}
                        onChange={handleToggle}
                        color="primary"
                        disabled={loading}
                        inputProps={{ 'aria-label': 'toggle 2FA' }}
                    />
                </Box>
            </Box>

            <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
                <DialogContent>
                    <Box textAlign="center" mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Scan QR Code
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mb={2}>
                            Scan this QR code with your authenticator app (e.g., Google Authenticator)
                        </Typography>
                        {qrCode && (
                            <Box mt={2} mb={2} display="flex" justifyContent="center">
                                <QRCode value={qrCode} size={200} />
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            label="Verification Code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            margin="normal"
                            placeholder="Enter 6-digit code"
                            inputProps={{
                                maxLength: 6,
                                pattern: '[0-9]*'
                            }}
                            helperText="Enter the 6-digit code from your authenticator app"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary" disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleVerify}
                        color="primary"
                        variant="contained"
                        disabled={loading || !verificationCode}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Verify & Enable'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TwoFactorAuth;
