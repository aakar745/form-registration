import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const ResponseDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Form Responses
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Response dashboard content will be implemented here.</Typography>
      </Paper>
    </Container>
  );
};

export default ResponseDashboard;
