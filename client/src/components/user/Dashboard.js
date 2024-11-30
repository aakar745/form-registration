import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
} from '@mui/material';

const UserDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Typography color="textSecondary">
          Here you can view and manage your forms and submissions.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Forms
            </Typography>
            <Typography>
              You haven't created any forms yet.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Submissions
            </Typography>
            <Typography>
              No recent form submissions.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard;
