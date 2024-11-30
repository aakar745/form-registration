import React, { useState } from 'react';
import {
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Button,
  CircularProgress,
  SaveIcon,
  RestartAltIcon,
} from '@mui/material';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const FormSettings = ({ settings, onUpdate, onSave, onReset, isSaving }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" gutterBottom>
        FORM SETTINGS
      </Typography>
      
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        aria-label="form settings tabs"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minWidth: 'auto',
            px: 3,
          },
        }}
      >
        <Tab label="BASIC" />
        <Tab label="STYLES" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="FORM TITLE"
            value={settings.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="FORM DESCRIPTION"
            value={settings.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.requireLogin || false}
                onChange={(e) => handleChange('requireLogin', e.target.checked)}
              />
            }
            label="REQUIRE LOGIN"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.multipleSubmissions || false}
                onChange={(e) => handleChange('multipleSubmissions', e.target.checked)}
              />
            }
            label="ALLOW MULTIPLE SUBMISSIONS"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotification || false}
                onChange={(e) => handleChange('emailNotification', e.target.checked)}
              />
            }
            label="SEND EMAIL NOTIFICATION"
          />
          <TextField
            fullWidth
            label="SUCCESS MESSAGE"
            value={settings.successMessage || 'Thank you for your submission!'}
            onChange={(e) => handleChange('successMessage', e.target.value)}
          />
        </Stack>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>THEME</InputLabel>
            <Select
              value={settings.theme || 'light'}
              label="Theme"
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>LAYOUT</InputLabel>
            <Select
              value={settings.layout || 'standard'}
              label="Layout"
              onChange={(e) => handleChange('layout', e.target.value)}
            >
              <MenuItem value="standard">Standard</MenuItem>
              <MenuItem value="compact">Compact</MenuItem>
              <MenuItem value="spacious">Spacious</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </TabPanel>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSaving ? 'Saving...' : 'SAVE FORM'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={onReset}
          startIcon={<RestartAltIcon />}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          RESET
        </Button>
      </Box>
    </Stack>
  );
};

export default FormSettings;
