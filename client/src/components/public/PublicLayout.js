import React from 'react';
import { Box, Container } from '@mui/material';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children, settings }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <PublicHeader settings={settings} />
      
      <Container
        component="main"
        sx={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          py: 4,
          px: { xs: 2, sm: 3 }
        }}
      >
        {children}
      </Container>

      <PublicFooter settings={settings} />
    </Box>
  );
};

export default PublicLayout;
