import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Divider,
    Box,
    CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from '../config/axios';
import TwoFactorAuth from '../components/TwoFactorAuth';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Profile Settings
                </Typography>

                <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Account Information
                        </Typography>
                        <Typography>
                            <strong>Email:</strong> {user?.email}
                        </Typography>
                        <Typography>
                            <strong>Role:</strong> {user?.role}
                        </Typography>
                        <Typography>
                            <strong>Member since:</strong>{' '}
                            {new Date(user?.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <TwoFactorAuth user={user} onUpdate={fetchUserProfile} />
                </Paper>
            </Box>
        </Container>
    );
};

export default Profile;
