import React, { useState } from 'react';
import {
  Box,
  Stack,
  TextField,
  Typography,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
  Popover,
} from '@mui/material';

export const defaultStyles = {
  labelColor: '#333333',
  labelFontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  inputHeight: 40,
  backgroundColor: '#ffffff',
  borderRadius: 4,
  borderColor: '#dddddd',
  borderWidth: 1,
  focusColor: '#1976d2',
  focusOpacity: 1,
  hoverOpacity: 0.8,
  textColor: '#333333',
  fontSize: 16,
  inputPadding: 10,
  spacing: 8,
  customCSS: '',
};

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Roboto',
  'Open Sans',
  'Lato',
];

const fontWeights = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: '100', label: 'Thin' },
  { value: '300', label: 'Light' },
  { value: '500', label: 'Medium' },
  { value: '700', label: 'Bold' },
  { value: '900', label: 'Black' },
];

const ColorPicker = ({ color, onChange, label }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Box
        onClick={handleClick}
        sx={{
          backgroundColor: color,
          width: '36px',
          height: '36px',
          borderRadius: '4px',
          border: '2px solid #ddd',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              onChange(e.target.value);
              handleClose();
            }}
            style={{
              width: '200px',
              height: '40px',
              padding: '0',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        </Box>
      </Popover>
    </Box>
  );
};

const StyleSettings = ({ styles, onChange }) => {
  const [activeTab, setActiveTab] = useState('typography');

  const handleChange = (field, value) => {
    onChange({ ...styles, [field]: value });
  };

  return (
    <Stack spacing={3}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Typography" value="typography" />
        <Tab label="Colors" value="colors" />
        <Tab label="Layout" value="layout" />
        <Tab label="Custom CSS" value="customCSS" />
      </Tabs>

      {activeTab === 'typography' && (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Font Family</InputLabel>
            <Select
              value={styles.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              label="Font Family"
            >
              {fontFamilies.map((font) => (
                <MenuItem key={font} value={font}>
                  {font}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Font Weight</InputLabel>
            <Select
              value={styles.fontWeight}
              onChange={(e) => handleChange('fontWeight', e.target.value)}
              label="Font Weight"
            >
              {fontWeights.map((weight) => (
                <MenuItem key={weight.value} value={weight.value}>
                  {weight.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography gutterBottom>Label Font Size</Typography>
            <Slider
              value={styles.labelFontSize}
              onChange={(_, value) => handleChange('labelFontSize', value)}
              min={12}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Input Font Size</Typography>
            <Slider
              value={styles.fontSize}
              onChange={(_, value) => handleChange('fontSize', value)}
              min={12}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </Stack>
      )}

      {activeTab === 'colors' && (
        <Stack spacing={3}>
          <ColorPicker
            color={styles.labelColor}
            onChange={(color) => handleChange('labelColor', color)}
            label="Label Color"
          />
          <ColorPicker
            color={styles.textColor}
            onChange={(color) => handleChange('textColor', color)}
            label="Text Color"
          />
          <ColorPicker
            color={styles.backgroundColor}
            onChange={(color) => handleChange('backgroundColor', color)}
            label="Background Color"
          />
          <ColorPicker
            color={styles.borderColor}
            onChange={(color) => handleChange('borderColor', color)}
            label="Border Color"
          />
          <ColorPicker
            color={styles.focusColor}
            onChange={(color) => handleChange('focusColor', color)}
            label="Focus Color"
          />
        </Stack>
      )}

      {activeTab === 'layout' && (
        <Stack spacing={2}>
          <Box>
            <Typography gutterBottom>Input Height (px)</Typography>
            <Slider
              value={styles.inputHeight}
              onChange={(_, value) => handleChange('inputHeight', value)}
              min={30}
              max={60}
              step={2}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Border Radius (px)</Typography>
            <Slider
              value={styles.borderRadius}
              onChange={(_, value) => handleChange('borderRadius', value)}
              min={0}
              max={20}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Border Width (px)</Typography>
            <Slider
              value={styles.borderWidth}
              onChange={(_, value) => handleChange('borderWidth', value)}
              min={0}
              max={5}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Input Padding (px)</Typography>
            <Slider
              value={styles.inputPadding}
              onChange={(_, value) => handleChange('inputPadding', value)}
              min={4}
              max={20}
              step={2}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Spacing (px)</Typography>
            <Slider
              value={styles.spacing}
              onChange={(_, value) => handleChange('spacing', value)}
              min={4}
              max={24}
              step={2}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Hover Opacity</Typography>
            <Slider
              value={styles.hoverOpacity}
              onChange={(_, value) => handleChange('hoverOpacity', value)}
              min={0}
              max={1}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Focus Opacity</Typography>
            <Slider
              value={styles.focusOpacity}
              onChange={(_, value) => handleChange('focusOpacity', value)}
              min={0}
              max={1}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </Stack>
      )}

      {activeTab === 'customCSS' && (
        <TextField
          fullWidth
          multiline
          rows={10}
          label="Custom CSS (JSON format)"
          value={styles.customCSS}
          onChange={(e) => handleChange('customCSS', e.target.value)}
          placeholder='{"&:hover": {"transform": "scale(1.02)"}}'
          helperText="Enter valid JSON object with CSS properties"
        />
      )}
    </Stack>
  );
};

export default StyleSettings;
