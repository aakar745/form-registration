import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  Avatar,
  Switch,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Add as AddIcon,
  List as ListIcon,
  Assignment as ResponseIcon,
  Security as SecurityIcon,
  Tune as FormSettingsIcon,
  AccountCircle as AccountIcon,
  History as AuditIcon,
  Public as PublicIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getVisiblePages } from '../../config/pages';

const drawerWidth = 280;

const menuItems = [
  { 
    title: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/admin' 
  },
  {
    title: 'Forms Management',
    icon: <DescriptionIcon />,
    subitems: [
      { title: 'Create Form', icon: <AddIcon />, path: '/admin/forms/new' },
      { title: 'My Forms', icon: <ListIcon />, path: '/admin/forms' }
    ]
  },
  {
    title: 'Responses Management',
    icon: <ResponseIcon />,
    subitems: [
      { title: 'View Responses', icon: <AssessmentIcon />, path: '/admin/responses' }
    ]
  },
  {
    title: 'User Management',
    icon: <PeopleIcon />,
    subitems: [
      { title: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
      { title: 'Roles & Permissions', icon: <SecurityIcon />, path: '/admin/roles' }
    ]
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    subitems: [
      { title: 'Form Settings', icon: <FormSettingsIcon />, path: '/admin/settings/forms' },
      { title: 'Account Settings', icon: <AccountIcon />, path: '/admin/settings/account' }
    ]
  },
  {
    title: 'Audit Logs',
    icon: <AuditIcon />,
    path: '/admin/audit-logs'
  },
  {
    title: 'Public Forms',
    icon: <PublicIcon />,
    path: '/admin/public-forms'
  }
];

const notifications = [
  { id: 1, message: 'New user registration', time: '5 minutes ago' },
  { id: 2, message: 'New form submission', time: '10 minutes ago' },
  { id: 3, message: 'System update available', time: '1 hour ago' },
];

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Get user data from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // Get visible pages based on user role and assignments
  const visiblePages = getVisiblePages(
    user?.role,
    JSON.parse(user?.assignedPages || '[]')
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuExpand = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item) => {
    if (item.subitems) {
      return (
        <React.Fragment key={item.title}>
          <ListItem 
            button 
            onClick={() => handleMenuExpand(item.title)}
            sx={{
              pl: 2,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
            {expandedMenus[item.title] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={expandedMenus[item.title]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subitems.map((subitem) => (
                <ListItem
                  button
                  key={subitem.title}
                  component={Link}
                  to={subitem.path}
                  selected={isCurrentPath(subitem.path)}
                  sx={{
                    pl: 4,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{subitem.icon}</ListItemIcon>
                  <ListItemText primary={subitem.title} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem
        button
        key={item.title}
        component={Link}
        to={item.path}
        selected={isCurrentPath(item.path)}
        sx={{
          pl: 2,
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
          },
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.title} />
      </ListItem>
    );
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // You can implement actual dark mode logic here
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Form Builder
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>

          {/* Dark Mode Toggle */}
          <Tooltip title="Toggle Dark Mode">
            <IconButton color="inherit" onClick={handleDarkModeToggle}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 },
            }}
          >
            {notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationClose}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body1">{notification.message}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {notification.time}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {/* Profile Menu */}
          <Tooltip title="Profile">
            <IconButton color="inherit" onClick={handleProfileClick}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleProfileClose}
          >
            <MenuItem>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={user?.username || 'User'} 
                secondary={user?.role || 'Role'} 
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: ['48px', '56px', '64px'],
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
