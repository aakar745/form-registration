import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const AuditLogs = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Audit Logs
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Audit logs will be displayed here.</Typography>
      </Paper>
    </Container>
  );
};

export default AuditLogs;
