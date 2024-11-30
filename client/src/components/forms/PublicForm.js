import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from '@formio/react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from '../../config/axios';

export default function PublicForm() {
  const { publicUrl } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [publicUrl]);

  const fetchForm = async () => {
    try {
      const response = await axios.get(`/api/forms/public/${publicUrl}`);
      setForm(response.data);
      setLoading(false);
    } catch (err) {
      setError('Form not found or no longer active');
      setLoading(false);
    }
  };

  const handleSubmit = async (submission) => {
    try {
      await axios.post(`/api/forms/public/${publicUrl}/submit`, submission);
      setSubmitted(true);
    } catch (err) {
      setError('Error submitting form. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="success">
            Thank you for your submission!
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {form.title}
          </Typography>
          
          {form.description && (
            <Typography variant="body1" color="textSecondary" paragraph>
              {form.description}
            </Typography>
          )}

          <Box sx={{ mt: 3 }}>
            <Form
              form={form.schema}
              onSubmit={handleSubmit}
              options={{
                readOnly: false,
                noAlerts: true,
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
