import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Stack,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const validationTypes = {
  text: [
    { value: 'required', label: 'Required' },
    { value: 'email', label: 'Email' },
    { value: 'minLength', label: 'Minimum Length' },
    { value: 'maxLength', label: 'Maximum Length' },
    { value: 'pattern', label: 'Pattern (Regex)' },
  ],
  textarea: [
    { value: 'required', label: 'Required' },
    { value: 'minLength', label: 'Minimum Length' },
    { value: 'maxLength', label: 'Maximum Length' },
  ],
  number: [
    { value: 'required', label: 'Required' },
    { value: 'min', label: 'Minimum Value' },
    { value: 'max', label: 'Maximum Value' },
  ],
  date: [
    { value: 'required', label: 'Required' },
    { value: 'minDate', label: 'Minimum Date' },
    { value: 'maxDate', label: 'Maximum Date' },
  ],
  file: [
    { value: 'required', label: 'Required' },
    { value: 'maxSize', label: 'Maximum Size (MB)' },
    { value: 'fileType', label: 'File Type' },
  ],
  select: [
    { value: 'required', label: 'Required' },
  ],
  radio: [
    { value: 'required', label: 'Required' },
  ],
  checkbox: [
    { value: 'required', label: 'Required' },
    { value: 'minChecked', label: 'Minimum Checked' },
    { value: 'maxChecked', label: 'Maximum Checked' },
  ],
};

const ValidationRule = ({ rule, onUpdate, onDelete, fieldType }) => {
  const handleChange = (field, value) => {
    onUpdate({ ...rule, [field]: value });
  };

  const renderValueInput = () => {
    switch (rule.type) {
      case 'minLength':
      case 'maxLength':
      case 'min':
      case 'max':
      case 'minChecked':
      case 'maxChecked':
        return (
          <TextField
            type="number"
            size="small"
            value={rule.value}
            onChange={(e) => handleChange('value', e.target.value)}
            fullWidth
          />
        );
      case 'pattern':
        return (
          <TextField
            size="small"
            value={rule.value}
            onChange={(e) => handleChange('value', e.target.value)}
            placeholder="Regular expression"
            fullWidth
          />
        );
      case 'fileType':
        return (
          <TextField
            size="small"
            value={rule.value}
            onChange={(e) => handleChange('value', e.target.value)}
            placeholder=".pdf,.doc,.docx"
            fullWidth
          />
        );
      case 'required':
        return null;
      default:
        return (
          <TextField
            size="small"
            value={rule.value}
            onChange={(e) => handleChange('value', e.target.value)}
            fullWidth
          />
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Rule Type</InputLabel>
        <Select
          value={rule.type}
          label="Rule Type"
          onChange={(e) => handleChange('type', e.target.value)}
        >
          {validationTypes[fieldType]?.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {renderValueInput()}
      <IconButton size="small" onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

const ValidationRules = ({ rules = [], onUpdate, fieldType }) => {
  const handleAddRule = () => {
    const newRule = {
      id: Date.now(),
      type: validationTypes[fieldType]?.[0]?.value || 'required',
      value: '',
    };
    onUpdate([...rules, newRule]);
  };

  const handleUpdateRule = (ruleId, updatedRule) => {
    onUpdate(rules.map(rule => rule.id === ruleId ? updatedRule : rule));
  };

  const handleDeleteRule = (ruleId) => {
    onUpdate(rules.filter(rule => rule.id !== ruleId));
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="primary">
        Validation Rules
      </Typography>
      {rules.map((rule) => (
        <ValidationRule
          key={rule.id}
          rule={rule}
          fieldType={fieldType}
          onUpdate={(updatedRule) => handleUpdateRule(rule.id, updatedRule)}
          onDelete={() => handleDeleteRule(rule.id)}
        />
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddRule}
        size="small"
      >
        Add Rule
      </Button>
    </Stack>
  );
};

export default ValidationRules;
