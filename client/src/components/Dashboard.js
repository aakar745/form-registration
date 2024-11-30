import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FileCopy as FileCopyIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTab, setCurrentTab] = useState('all');
  const [userProfile, setUserProfile] = useState(null);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchForms();
    fetchUserProfile();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get('/api/forms');
      setForms(response.data?.forms || []); // Ensure we always have an array
      setError(null);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setError(error.response?.data?.message || 'Error loading forms');
      setForms([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/user/settings');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleCreateForm = () => {
    navigate('/forms/new');
  };

  const handleMenuOpen = (event, form) => {
    setAnchorEl(event.currentTarget);
    setSelectedForm(form);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleEditClick = () => {
    handleMenuClose();
    if (selectedForm) {
      navigate(`/forms/edit/${selectedForm.id}`);
    }
  };

  const handleViewClick = () => {
    handleMenuClose();
    if (selectedForm) {
      navigate(`/forms/view/${selectedForm.id}`);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/forms/${selectedForm.id}`);
      setSnackbar({
        open: true,
        message: 'Form deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      fetchForms(); // Refresh the forms list
    } catch (error) {
      console.error('Error deleting form:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting form',
        severity: 'error'
      });
    }
  };

  const handleDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedForm(null);
  };

  const handleDuplicateForm = async () => {
    try {
      const duplicatedForm = {
        ...selectedForm,
        title: `${selectedForm.title} (Copy)`,
      };
      delete duplicatedForm.id;
      
      await axios.post('/api/forms', duplicatedForm);
      handleMenuClose();
      setSnackbar({
        open: true,
        message: 'Form duplicated successfully',
        severity: 'success',
      });
      fetchForms();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error duplicating form',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredForms = forms.filter(form => {
    switch (currentTab) {
      case 'published':
        return form.status === 'published';
      case 'draft':
        return form.status === 'draft';
      case 'archived':
        return form.status === 'archived';
      default:
        return true;
    }
  });

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleSettingsClick = () => {
    handleUserMenuClose();
    navigate('/settings');
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderFormList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (!Array.isArray(forms) || forms.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="textSecondary">
            No forms found. Create your first form!
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {filteredForms.map((form) => (
          <Grid item xs={12} sm={6} md={4} key={form.id}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" component="h2" gutterBottom>
                    {form.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, form)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label={form.status || 'draft'}
                    size="small"
                    color={getStatusColor(form.status)}
                  />
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => {
                    setSelectedForm(form);
                    handleViewClick();
                  }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setSelectedForm(form);
                    handleEditClick();
                  }}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Forms
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateForm}
            >
              Create Form
            </Button>
            <IconButton
              onClick={handleUserMenuOpen}
              size="large"
              edge="end"
              aria-label="account"
              aria-haspopup="true"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ py: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1">
              My Forms
            </Typography>
          </Box>

          {renderFormList()}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEditClick}>
              <EditIcon sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={handleViewClick}>
              <VisibilityIcon sx={{ mr: 1 }} /> View
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </MenuItem>
            <MenuItem onClick={handleDuplicateForm}>
              <FileCopyIcon sx={{ mr: 1 }} /> Duplicate
            </MenuItem>
          </Menu>

          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Form</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this form? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          <Menu
            anchorEl={userMenuAnchorEl}
            open={Boolean(userMenuAnchorEl)}
            onClose={() => setUserMenuAnchorEl(null)}
          >
            {user?.role === 'admin' && (
              <MenuItem onClick={() => navigate('/admin')}>
                <ListItemIcon>
                  <SecurityIcon fontSize="small" />
                </ListItemIcon>
                Admin Panel
              </MenuItem>
            )}
            <MenuItem onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Container>
    </Box>
  );
}
