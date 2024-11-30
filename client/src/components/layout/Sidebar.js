import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItemIcon, 
  ListItemText, 
  Toolbar,
  Collapse,
  ListItemButton,
  Box,
  Tooltip,
  useTheme
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import PublicIcon from '@mui/icons-material/Public';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;
const closedDrawerWidth = 73;

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/admin' 
  },
  {
    text: 'Forms Management',
    icon: <DescriptionIcon />,
    children: [
      { text: 'Create Form', icon: <AddCircleOutlineIcon />, path: '/admin/forms/new' },
      { text: 'My Forms', icon: <ListAltIcon />, path: '/admin/forms' }
    ]
  },
  {
    text: 'Responses Management',
    icon: <AssessmentIcon />,
    children: [
      { text: 'View Responses', icon: <AssessmentIcon />, path: '/admin/responses' }
    ]
  },
  {
    text: 'User Management',
    icon: <PeopleIcon />,
    children: [
      { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
      { text: 'Roles & Permissions', icon: <SecurityIcon />, path: '/admin/roles' }
    ]
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    children: [
      { text: 'Form Settings', icon: <TuneIcon />, path: '/admin/settings/forms' },
      { text: 'Account Settings', icon: <AccountCircleIcon />, path: '/admin/settings/account' }
    ]
  },
  { text: 'Audit Logs', icon: <HistoryIcon />, path: '/admin/audit-logs' },
  { text: 'Public Forms', icon: <PublicIcon />, path: '/admin/public-forms' }
];

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const theme = useTheme();

  const handleClick = (text) => {
    if (open) {
      setOpenMenus(prev => ({
        ...prev,
        [text]: !prev[text]
      }));
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : closedDrawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : closedDrawerWidth,
          boxSizing: 'border-box',
          bgcolor: theme.palette.mode === 'light' ? '#fff' : '#1e1e1e',
          borderRight: `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : '#333'}`,
          overflowX: 'hidden',
          transition: theme =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
    >
      <Toolbar />
      <List 
        component="nav" 
        sx={{ 
          pt: 1,
          height: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}
      >
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <Box key={item.text}>
                <Tooltip title={!open ? item.text : ""} placement="right" arrow>
                  <ListItemButton 
                    onClick={() => handleClick(item.text)}
                    sx={{ 
                      minHeight: 48,
                      px: 2.5,
                      justifyContent: open ? 'initial' : 'center',
                      color: theme.palette.mode === 'light' ? '#2c3e50' : '#fff',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'light' 
                          ? 'rgba(25, 118, 210, 0.08)'
                          : 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <>
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        />
                        {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
                {open && (
                  <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.text}
                          component={Link}
                          to={child.path}
                          selected={location.pathname === child.path}
                          sx={{
                            pl: 4,
                            py: 1,
                            minHeight: 40,
                            color: theme.palette.mode === 'light' ? '#2c3e50' : '#fff',
                            '&.Mui-selected': {
                              bgcolor: theme.palette.primary.main,
                              color: '#fff',
                              '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                              },
                              '& .MuiListItemIcon-root': {
                                color: '#fff',
                              },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={child.text}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: 400
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          }
          return (
            <Tooltip key={item.text} title={!open ? item.text : ""} placement="right" arrow>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{ 
                  minHeight: 48,
                  px: 2.5,
                  justifyContent: open ? 'initial' : 'center',
                  color: theme.palette.mode === 'light' ? '#2c3e50' : '#fff',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#fff',
                    },
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
