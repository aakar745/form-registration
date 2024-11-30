import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import axios from 'axios';
import PublicLayout from './PublicLayout';

const PublicFormView = () => {
  const { formId } = useParams();
  const theme = useTheme();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`/api/forms/public/${formId}`);
        setForm(response.data);
        setError(null);
        document.title = `${response.data.settings.title || 'Online Form'} | FormFlow`;
      } catch (err) {
        setError('Form not found or no longer available');
        document.title = 'Form Not Found | FormFlow';
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleSubmit = async (formData) => {
    try {
      await axios.post(`/api/forms/${formId}/submit`, formData);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 'sm', 
            mx: 'auto',
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      );
    }

    if (submitted) {
      return (
        <Alert 
          severity="success"
          sx={{ 
            maxWidth: 'sm', 
            mx: 'auto',
            borderRadius: 2
          }}
        >
          Thank you for your submission! Your response has been recorded.
        </Alert>
      );
    }

    if (!form) return null;

    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          bgcolor: 'background.paper',
          maxWidth: 'sm',
          mx: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {form.settings.title}
        </Typography>
        {form.settings.description && (
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4 }}
          >
            {form.settings.description}
          </Typography>
        )}
        {/* Form fields will be rendered here */}
      </Paper>
    );
  };

  return (
    <PublicLayout formTitle={form?.settings?.title || 'Online Form'}>
      {renderContent()}
    </PublicLayout>
  );
};

export default PublicFormView;
