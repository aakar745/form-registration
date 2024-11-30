import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const RolesPermissions = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Roles & Permissions
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Roles and permissions management will be implemented here.</Typography>
      </Paper>
    </Container>
  );
};

export default RolesPermissions;
