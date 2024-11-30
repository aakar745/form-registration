import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { toast } from 'react-toastify';

const CreateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    settings: {
      isPublic: false,
      requiresAuth: false,
      title: '',
      description: '',
      header: {
        showLogo: true,
        logoUrl: '',
        brandName: '',
        backgroundColor: '',
        textColor: '',
        navigationLinks: []
      },
      footer: {
        showFooter: true,
        copyrightText: '',
        backgroundColor: '',
        textColor: '',
        links: []
      }
    },
    schema: {
      fields: [],
      validationRules: {}
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
      settings: {
        ...prevState.settings,
        title: name === 'title' ? value : prevState.settings.title,
        description: name === 'description' ? value : prevState.settings.description
      }
    }));
  };

  const handlePublicChange = (e) => {
    const isPublic = e.target.checked;
    setFormData(prevState => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        isPublic
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/forms', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Form created:', response.data);
      toast.success('Form created successfully');
      navigate('/admin/forms');
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error(error.response?.data?.message || 'Failed to create form');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Form
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              name="title"
              label="Form Title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.settings.isPublic}
                  onChange={handlePublicChange}
                  name="isPublic"
                />
              }
              label="Make form public"
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/forms')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Create Form
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateForm;
