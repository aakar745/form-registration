import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Stack,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';

const PublicFooter = ({ settings }) => {
  const theme = useTheme();
  const {
    showFooter = true,
    copyrightText,
    links = [],
    customText,
    backgroundColor,
    textColor
  } = settings?.footer || {};

  if (!showFooter) return null;

  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: backgroundColor || 'background.paper',
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          {/* Left section */}
          <Typography
            variant="body2"
            sx={{ 
              textAlign: { xs: 'center', sm: 'left' },
              color: textColor || 'text.secondary'
            }}
          >
            {copyrightText || ` ${currentYear} FormFlow. All rights reserved.`}
          </Typography>

          {/* Center section - Links */}
          {links.length > 0 && (
            <Stack
              direction="row"
              spacing={3}
              sx={{
                order: { xs: -1, sm: 0 },
                justifyContent: 'center'
              }}
            >
              {links.map((link, index) => (
                <MuiLink
                  key={index}
                  component={Link}
                  to={link.url}
                  sx={{
                    color: textColor || 'text.secondary',
                    '&:hover': {
                      color: theme.palette.primary.main
                    }
                  }}
                  underline="hover"
                  variant="body2"
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          )}

          {/* Right section */}
          {customText && (
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: textColor || 'text.secondary'
              }}
            >
              {customText}
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default PublicFooter;
