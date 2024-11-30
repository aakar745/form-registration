import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const AccountSettings = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Account settings configuration will be implemented here.</Typography>
      </Paper>
    </Container>
  );
};

export default AccountSettings;
