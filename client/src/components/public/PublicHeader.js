import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  useTheme,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';

const PublicHeader = ({ settings }) => {
  const theme = useTheme();
  const {
    showLogo,
    logoUrl,
    brandName,
    backgroundColor,
    textColor,
    showAdminButton,
    navigation = []
  } = settings?.header || {};

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        bgcolor: backgroundColor || 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 70 }}>
          {/* Logo/Brand */}
          {showLogo && (
            <Box sx={{ display: 'flex', alignItems: 'center', flex: { xs: 1, md: 'none' } }}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={brandName || 'Logo'} 
                  style={{ height: 40, width: 'auto' }}
                />
              ) : (
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
                  sx={{
                    fontWeight: 700,
                    color: textColor || theme.palette.primary.main,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {brandName || 'FormFlow'}
                </Typography>
              )}
            </Box>
          )}

          {/* Navigation */}
          {navigation.length > 0 && (
            <Stack
              direction="row"
              spacing={3}
              sx={{
                flex: 1,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center'
              }}
            >
              {navigation.map((nav, index) => (
                <Button
                  key={index}
                  component={Link}
                  to={nav.url}
                  sx={{
                    color: textColor || 'text.primary',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  {nav.label}
                </Button>
              ))}
            </Stack>
          )}

          {/* Right Section */}
          {showAdminButton && (
            <Box sx={{ flex: { xs: 1, md: 'none' }, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                to="/admin"
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderColor: textColor,
                  color: textColor
                }}
              >
                Admin Portal
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default PublicHeader;
