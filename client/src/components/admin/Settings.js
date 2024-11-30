import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Settings = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Main settings page will be implemented here.</Typography>
      </Paper>
    </Container>
  );
};

export default Settings;
