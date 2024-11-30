import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const PublicForms = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Public Forms
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Public forms will be displayed here.</Typography>
      </Paper>
    </Container>
  );
};

export default PublicForms;
