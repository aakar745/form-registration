import React from 'react';
import { Typography, Paper, Grid, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';

const StatCard = ({ icon, value, label, color, trend }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease'
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {React.cloneElement(icon, { 
        sx: { 
          fontSize: 28,
          color,
          bgcolor: `${color}15`,
          p: 1,
          borderRadius: 1,
        }
      })}
    </Box>
    <Box sx={{ mt: 2 }}>
      <Typography variant="h3" component="div" sx={{ 
        fontWeight: 500,
        fontSize: '2.5rem',
        mb: 1,
        color: 'text.primary'
      }}>
        {value}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
        {label}
      </Typography>
      {trend && (
        <Typography variant="body2" sx={{ 
          color: trend.startsWith('+') ? 'success.main' : 'error.main',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: '0.875rem'
        }}>
          {trend} than last week
        </Typography>
      )}
    </Box>
  </Paper>
);

const Dashboard = () => {
  const stats = [
    { 
      icon: <PeopleIcon />, 
      value: '150', 
      label: 'Total Users', 
      color: '#1976d2',
      trend: '+12.5%'
    },
    { 
      icon: <DescriptionIcon />, 
      value: '45', 
      label: 'Total Forms', 
      color: '#2e7d32',
      trend: '+8.3%'
    },
    { 
      icon: <AssessmentIcon />, 
      value: '328', 
      label: 'Total Responses', 
      color: '#ed6c02',
      trend: '+15.7%'
    },
    { 
      icon: <VisibilityIcon />, 
      value: '1,250', 
      label: 'Total Views', 
      color: '#9c27b0',
      trend: '+23.1%'
    },
  ];

  return (
    <>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 4, 
          fontWeight: 500,
          color: 'text.primary'
        }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          bgcolor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 500,
            color: 'text.primary',
            mb: 2
          }}
        >
          Welcome to the Admin Dashboard
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Here you can manage users, forms, and view statistics about your application. Use the sidebar menu to navigate between different sections.
        </Typography>
      </Paper>
    </>
  );
};

export default Dashboard;
