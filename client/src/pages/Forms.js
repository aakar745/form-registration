import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import { toast } from 'react-toastify';

const Forms = () => {
  const [forms, setForms] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = () => {
    try {
      const savedForms = JSON.parse(localStorage.getItem('forms') || '[]');
      setForms(savedForms);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Failed to load forms');
    }
  };

  const handleEdit = (formId) => {
    navigate(`/form-builder/${formId}`);
  };

  const handleDelete = (form) => {
    setSelectedForm(form);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    try {
      const updatedForms = forms.filter(f => f.settings.id !== selectedForm.settings.id);
      localStorage.setItem('forms', JSON.stringify(updatedForms));
      setForms(updatedForms);
      toast.success('Form deleted successfully');
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    }
    setDeleteDialogOpen(false);
    setSelectedForm(null);
  };

  const handleShare = (formId) => {
    const shareUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Form URL copied to clipboard');
  };

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3
        }}
      >
        <Typography variant="h4" component="h1">
          Forms
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/form-builder')}
          startIcon={<span>+</span>}
        >
          CREATE FORM
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.settings.id}>
                <TableCell>{form.settings.title || 'Untitled Form'}</TableCell>
                <TableCell>{form.settings.description || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={form.settings.status || 'Draft'} 
                    size="small"
                    color={form.settings.status === 'Public' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>{new Date(form.createdAt || form.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleEdit(form.settings.id)} 
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleShare(form.settings.id)} 
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(form)} 
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {forms.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No forms yet. Click "CREATE FORM" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{selectedForm?.settings.title || 'Untitled Form'}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Forms;
