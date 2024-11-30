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

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does Not Contain' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'isEmpty', label: 'Is Empty' },
  { value: 'isNotEmpty', label: 'Is Not Empty' },
];

const actions = [
  { value: 'show', label: 'Show Field' },
  { value: 'hide', label: 'Hide Field' },
  { value: 'require', label: 'Make Required' },
  { value: 'optional', label: 'Make Optional' },
];

const Condition = ({ condition, availableFields, onUpdate, onDelete }) => {
  const handleChange = (field, value) => {
    onUpdate({ ...condition, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>If Field</InputLabel>
        <Select
          value={condition.sourceField}
          label="If Field"
          onChange={(e) => handleChange('sourceField', e.target.value)}
        >
          {availableFields.map((field) => (
            <MenuItem key={field.id} value={field.id}>
              {field.label || field.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          value={condition.operator}
          label="Operator"
          onChange={(e) => handleChange('operator', e.target.value)}
        >
          {operators.map((op) => (
            <MenuItem key={op.value} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!['isEmpty', 'isNotEmpty'].includes(condition.operator) && (
        <TextField
          size="small"
          value={condition.value}
          onChange={(e) => handleChange('value', e.target.value)}
          placeholder="Value"
          sx={{ minWidth: 120 }}
        />
      )}

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Then</InputLabel>
        <Select
          value={condition.action}
          label="Then"
          onChange={(e) => handleChange('action', e.target.value)}
        >
          {actions.map((action) => (
            <MenuItem key={action.value} value={action.value}>
              {action.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <IconButton size="small" onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

const ConditionalLogic = ({ conditions = [], availableFields = [], onUpdate }) => {
  const handleAddCondition = () => {
    const newCondition = {
      id: Date.now(),
      sourceField: availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
      action: 'show',
    };
    onUpdate([...conditions, newCondition]);
  };

  const handleUpdateCondition = (conditionId, updatedCondition) => {
    onUpdate(conditions.map(condition => 
      condition.id === conditionId ? updatedCondition : condition
    ));
  };

  const handleDeleteCondition = (conditionId) => {
    onUpdate(conditions.filter(condition => condition.id !== conditionId));
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="primary">
        Conditional Logic
      </Typography>
      {conditions.map((condition) => (
        <Condition
          key={condition.id}
          condition={condition}
          availableFields={availableFields}
          onUpdate={(updatedCondition) => handleUpdateCondition(condition.id, updatedCondition)}
          onDelete={() => handleDeleteCondition(condition.id)}
        />
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddCondition}
        size="small"
      >
        Add Condition
      </Button>
    </Stack>
  );
};

export default ConditionalLogic;
