import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Tabs,
  Tab,
  Paper,
  Divider,
  FormHelperText,
  FormLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Checkbox,
  FormControlLabel,
  IconButton,
  Switch,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ValidationRules from './ValidationRules';
import ConditionalLogic from './ConditionalLogic';
import StyleSettings from './StyleSettings';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../config/axios';

// Import basic form components
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ImageIcon from '@mui/icons-material/Image';
import ShortTextIcon from '@mui/icons-material/ShortText';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import SubjectIcon from '@mui/icons-material/Subject';
import Filter9Icon from '@mui/icons-material/Filter9';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';

const Builder = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
}));

const Panel = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  height: '100%',
  overflow: 'auto',
}));

const ComponentItem = styled(Box)(({ theme, isDragging }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: isDragging ? theme.palette.action.selected : theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'grab',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PreviewItem = styled(Box)(({ theme, isSelected }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.2s',
  '$:hover': {
    opacity: 1,
  },
}));

const componentTypes = [
  { type: 'text', label: 'Text Field', icon: <ShortTextIcon /> },
  { type: 'textarea', label: 'Text Area', icon: <SubjectIcon /> },
  { type: 'number', label: 'Number', icon: <Filter9Icon /> },
  { type: 'email', label: 'Email', icon: <EmailIcon /> },
  { type: 'password', label: 'Password', icon: <LockIcon /> },
  { type: 'select', label: 'Dropdown', icon: <ArrowDropDownCircleIcon /> },
  { type: 'radio', label: 'Radio Group', icon: <RadioButtonCheckedIcon /> },
  { type: 'checkbox', label: 'Checkbox Group', icon: <CheckBoxIcon /> },
  { type: 'date', label: 'Date', icon: <DateRangeIcon /> },
  { type: 'time', label: 'Time', icon: <AccessTimeIcon /> },
  { type: 'file', label: 'File Upload', icon: <AttachFileIcon /> },
  { type: 'image', label: 'Image Upload', icon: <ImageIcon /> },
];

const defaultFieldSettings = {
  label: '',
  placeholder: '',
  required: false,
  description: '',
  options: [],
  validationRules: [],
  conditionalLogic: [],
  styles: {
    labelColor: '#333',
    labelFontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    inputHeight: 40,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    focusColor: '#333',
    focusOpacity: 1,
    hoverOpacity: 0.8,
    textColor: '#333',
    fontSize: 16,
    inputPadding: 10,
    spacing: 8,
    customCSS: ''
  },
};

const defaultFormSettings = {
  id: uuidv4(),
  title: '',
  description: '',
  theme: 'light',
  layout: 'standard',
  status: 'draft',
  requireLogin: false,
  multipleSubmissions: false,
  emailNotification: false,
  successMessage: 'Thank you for your submission!',
  header: {
    showLogo: true,
    logoUrl: '',
    brandName: '',
    backgroundColor: '',
    textColor: '',
    showAdminButton: true,
    navigation: []
  },
  footer: {
    showFooter: true,
    copyrightText: '',
    links: [],
    customText: '',
    backgroundColor: '',
    textColor: ''
  },
  styles: {
    labelColor: '#333',
    labelFontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    inputHeight: 40,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    focusColor: '#333',
    focusOpacity: 1,
    hoverOpacity: 0.8,
    textColor: '#333',
    fontSize: 16,
    inputPadding: 10,
    spacing: 8,
    customCSS: ''
  },
};

const ComponentSettings = ({ component, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const handleChange = (field, value) => {
    onUpdate({
      ...component,
      settings: { ...component.settings, [field]: value }
    });
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Basic" value="basic" />
          <Tab label="Validation" value="validation" />
          <Tab label="Style" value="style" />
        </Tabs>
      </Box>

      {activeTab === 'basic' && (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Label"
            value={component.settings.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
          />
          <TextField
            fullWidth
            label="Description"
            value={component.settings.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Placeholder"
            value={component.settings.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={component.settings.required || false}
                onChange={(e) => handleChange('required', e.target.checked)}
              />
            }
            label="Required"
          />
          {['select', 'radio', 'checkbox'].includes(component.type) && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              {(component.settings.options || ['Option 1']).map((option, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(component.settings.options || ['Option 1'])];
                      newOptions[index] = e.target.value;
                      handleChange('options', newOptions);
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newOptions = [...(component.settings.options || ['Option 1'])];
                      newOptions.splice(index, 1);
                      handleChange('options', newOptions);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  const newOptions = [...(component.settings.options || ['Option 1']), 'New Option'];
                  handleChange('options', newOptions);
                }}
              >
                Add Option
              </Button>
            </Box>
          )}
        </Stack>
      )}

      <Button
        variant="outlined"
        color="error"
        onClick={() => onDelete(component.instanceId)}
        startIcon={<DeleteIcon />}
        sx={{ mt: 2 }}
      >
        Delete Component
      </Button>
    </Stack>
  );
};

const FormElementPreview = ({ element, formElements }) => {
  const { type, settings } = element;

  const baseStyles = {
    mb: 3,
    '& .MuiFormLabel-root': {
      color: 'text.primary',
      mb: 1,
    },
    '& .MuiInputBase-root': {
      backgroundColor: 'background.paper',
    },
    '& .MuiFormHelperText-root': {
      mx: 0,
      mt: 1,
    },
  };

  const renderFormElement = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <TextField
            fullWidth
            type={type}
            label={settings.label || `${type.charAt(0).toUpperCase() + type.slice(1)} Field`}
            placeholder={settings.placeholder}
            helperText={settings.description}
            required={settings.required}
            variant="outlined"
            sx={baseStyles}
          />
        );
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={settings.label || 'Text Area'}
            placeholder={settings.placeholder}
            helperText={settings.description}
            required={settings.required}
            variant="outlined"
            sx={baseStyles}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{settings.label || 'Select Field'}</InputLabel>
            <Select
              value=""
              label={settings.label || 'Select Field'}
              disabled
            >
              {settings.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {settings.helperText && (
              <FormHelperText>{settings.helperText}</FormHelperText>
            )}
          </FormControl>
        );
      case 'radio':
        return (
          <FormControl component="fieldset">
            <FormLabel component="legend">{settings.label || 'Radio Group'}</FormLabel>
            <RadioGroup>
              {settings.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {settings.helperText && (
              <FormHelperText>{settings.helperText}</FormHelperText>
            )}
          </FormControl>
        );
      case 'checkbox':
        return (
          <FormControl component="fieldset">
            <FormLabel component="legend">{settings.label || 'Checkbox Group'}</FormLabel>
            <FormGroup>
              {settings.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox />}
                  label={option}
                />
              ))}
            </FormGroup>
            {settings.helperText && (
              <FormHelperText>{settings.helperText}</FormHelperText>
            )}
          </FormControl>
        );
      case 'date':
      case 'time':
        return (
          <TextField
            fullWidth
            type={type}
            label={settings.label || `${type.charAt(0).toUpperCase() + type.slice(1)} Field`}
            InputLabelProps={{ shrink: true }}
            required={settings.required}
            helperText={settings.description}
            variant="outlined"
            sx={baseStyles}
          />
        );
      case 'file':
      case 'image':
        return (
          <FormControl fullWidth>
            <Button
              variant="outlined"
              component="label"
              startIcon={type === 'file' ? <AttachFileIcon /> : <ImageIcon />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              {type === 'file' ? 'Upload File' : 'Upload Image'}
              <input 
                type="file" 
                hidden 
                accept={type === 'image' ? 'image/*' : undefined}
              />
            </Button>
            {settings.helperText && (
              <FormHelperText>{settings.helperText}</FormHelperText>
            )}
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
      }}
    >
      {renderFormElement()}
    </Box>
  );
};

const ComponentList = ({ components, provided, snapshot }) => {
  return (
    <Box {...provided.droppableProps} ref={provided.innerRef}>
      {components.map((component, index) => (
        <Draggable key={component.id} draggableId={component.id} index={index}>
          {(provided, snapshot) => (
            <ComponentItem
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              isDragging={snapshot.isDragging}
            >
              {component.icon}
              <Typography>{component.label}</Typography>
            </ComponentItem>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </Box>
  );
};

const FormPreview = ({ elements, onSelectComponent, selectedComponent, provided, formElements }) => {
  return (
    <Box
      {...provided.droppableProps}
      ref={provided.innerRef}
      sx={{
        minHeight: '100%',
        backgroundColor: 'background.default',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
      }}
    >
      {elements.map((element, index) => (
        <Draggable key={element.instanceId} draggableId={String(element.instanceId)} index={index}>
          {(provided, snapshot) => (
            <PreviewItem
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={() => onSelectComponent(element)}
              isSelected={selectedComponent?.instanceId === element.instanceId}
            >
              <FormElementPreview element={element} formElements={formElements} />
            </PreviewItem>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </Box>
  );
};

const FormSettings = ({ settings, onUpdate, onSave, onReset, isSaving }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  const handleHeaderChange = (field, value) => {
    onUpdate({ ...settings, header: { ...settings.header, [field]: value } });
  };

  const handleFooterChange = (field, value) => {
    onUpdate({ ...settings, footer: { ...settings.footer, [field]: value } });
  };

  return (
    <Stack spacing={2}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Basic" value="basic" />
        <Tab label="Styles" value="styles" />
        <Tab label="Header" value="header" />
        <Tab label="Footer" value="footer" />
      </Tabs>

      {activeTab === 'basic' && (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Form Title"
            value={settings.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          <TextField
            fullWidth
            label="Form Description"
            multiline
            rows={2}
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={settings.status}
              onChange={(e) => handleChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="draft">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'warning.main' 
                  }} />
                  Draft
                </Box>
              </MenuItem>
              <MenuItem value="private">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'error.main' 
                  }} />
                  Private
                </Box>
              </MenuItem>
              <MenuItem value="public">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main' 
                  }} />
                  Public
                </Box>
              </MenuItem>
            </Select>
            <FormHelperText>
              {settings.status === 'draft' && 'Form is not yet ready for submissions'}
              {settings.status === 'private' && 'Only specific users can access this form'}
              {settings.status === 'public' && 'Anyone can access and submit this form'}
            </FormHelperText>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={settings.requireLogin}
                onChange={(e) => handleChange('requireLogin', e.target.checked)}
              />
            }
            label="Require Login"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.multipleSubmissions}
                onChange={(e) => handleChange('multipleSubmissions', e.target.checked)}
              />
            }
            label="Allow Multiple Submissions"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotification}
                onChange={(e) => handleChange('emailNotification', e.target.checked)}
              />
            }
            label="Send Email Notification"
          />
          <TextField
            fullWidth
            label="Success Message"
            value={settings.successMessage}
            onChange={(e) => handleChange('successMessage', e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Theme</InputLabel>
            <Select label="Theme" value={settings.theme} onChange={(e) => handleChange('theme', e.target.value)}>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Layout</InputLabel>
            <Select label="Layout" value={settings.layout} onChange={(e) => handleChange('layout', e.target.value)}>
              <MenuItem value="standard">Standard</MenuItem>
              <MenuItem value="compact">Compact</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}

      {activeTab === 'styles' && (
        <StyleSettings
          styles={settings.styles}
          onChange={(styles) => onUpdate({ ...settings, styles })}
        />
      )}

      {activeTab === 'header' && (
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.header.showLogo}
                onChange={(e) => handleHeaderChange('showLogo', e.target.checked)}
              />
            }
            label="Show Logo"
          />
          <TextField
            fullWidth
            label="Logo URL"
            value={settings.header.logoUrl}
            onChange={(e) => handleHeaderChange('logoUrl', e.target.value)}
          />
          <TextField
            fullWidth
            label="Brand Name"
            value={settings.header.brandName}
            onChange={(e) => handleHeaderChange('brandName', e.target.value)}
          />
          <TextField
            fullWidth
            label="Background Color"
            value={settings.header.backgroundColor}
            onChange={(e) => handleHeaderChange('backgroundColor', e.target.value)}
          />
          <TextField
            fullWidth
            label="Text Color"
            value={settings.header.textColor}
            onChange={(e) => handleHeaderChange('textColor', e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.header.showAdminButton}
                onChange={(e) => handleHeaderChange('showAdminButton', e.target.checked)}
              />
            }
            label="Show Admin Button"
          />
          <Typography variant="subtitle2" gutterBottom>
            Navigation
          </Typography>
          {(settings.header.navigation || []).map((nav, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Label"
                value={nav.label}
                onChange={(e) => {
                  const newNav = [...(settings.header.navigation || [])];
                  newNav[index] = { ...newNav[index], label: e.target.value };
                  handleHeaderChange('navigation', newNav);
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="URL"
                value={nav.url}
                onChange={(e) => {
                  const newNav = [...(settings.header.navigation || [])];
                  newNav[index] = { ...newNav[index], url: e.target.value };
                  handleHeaderChange('navigation', newNav);
                }}
              />
              <IconButton
                size="small"
                onClick={() => {
                  const newNav = [...(settings.header.navigation || [])];
                  newNav.splice(index, 1);
                  handleHeaderChange('navigation', newNav);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              const newNav = [...(settings.header.navigation || []), { label: 'New Navigation', url: '' }];
              handleHeaderChange('navigation', newNav);
            }}
          >
            Add Navigation
          </Button>
        </Stack>
      )}

      {activeTab === 'footer' && (
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.footer.showFooter}
                onChange={(e) => handleFooterChange('showFooter', e.target.checked)}
              />
            }
            label="Show Footer"
          />
          <TextField
            fullWidth
            label="Copyright Text"
            value={settings.footer.copyrightText}
            onChange={(e) => handleFooterChange('copyrightText', e.target.value)}
          />
          <Typography variant="subtitle2" gutterBottom>
            Links
          </Typography>
          {(settings.footer.links || []).map((link, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Label"
                value={link.label}
                onChange={(e) => {
                  const newLinks = [...(settings.footer.links || [])];
                  newLinks[index] = { ...newLinks[index], label: e.target.value };
                  handleFooterChange('links', newLinks);
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="URL"
                value={link.url}
                onChange={(e) => {
                  const newLinks = [...(settings.footer.links || [])];
                  newLinks[index] = { ...newLinks[index], url: e.target.value };
                  handleFooterChange('links', newLinks);
                }}
              />
              <IconButton
                size="small"
                onClick={() => {
                  const newLinks = [...(settings.footer.links || [])];
                  newLinks.splice(index, 1);
                  handleFooterChange('links', newLinks);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              const newLinks = [...(settings.footer.links || []), { label: 'New Link', url: '' }];
              handleFooterChange('links', newLinks);
            }}
          >
            Add Link
          </Button>
          <TextField
            fullWidth
            label="Custom Text"
            value={settings.footer.customText}
            onChange={(e) => handleFooterChange('customText', e.target.value)}
          />
          <TextField
            fullWidth
            label="Background Color"
            value={settings.footer.backgroundColor}
            onChange={(e) => handleFooterChange('backgroundColor', e.target.value)}
          />
          <TextField
            fullWidth
            label="Text Color"
            value={settings.footer.textColor}
            onChange={(e) => handleFooterChange('textColor', e.target.value)}
          />
        </Stack>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSaving ? 'Saving...' : 'Save Form'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={onReset}
          startIcon={<RestartAltIcon />}
        >
          Reset Form
        </Button>
      </Box>
    </Stack>
  );
};

const FormBuilder = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [selectedElement, setSelectedElement] = useState(null);
  const [formElements, setFormElements] = useState([]);
  const [formSettings, setFormSettings] = useState(defaultFormSettings);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [draggingComponent, setDraggingComponent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (formId) {
        try {
          const response = await axios.get(`/api/forms/${formId}`);
          console.log('Loaded form data:', response.data);
          
          // Set form elements
          if (Array.isArray(response.data.elements)) {
            setFormElements(response.data.elements);
          } else {
            setFormElements([]);
          }
          
          // Set form settings
          const loadedSettings = {
            ...defaultFormSettings,
            title: response.data.title || '',
            description: response.data.description || '',
            id: formId
          };
          setFormSettings(loadedSettings);
          
        } catch (error) {
          console.error('Error loading form:', error);
          toast.error('Failed to load form');
          navigate('/admin/forms');
        }
      }
    };

    loadForm();
  }, [formId, navigate]);

  const handleSaveForm = async () => {
    try {
      setIsSaving(true);
      
      // Prepare form data
      const formData = {
        title: formSettings.title || 'Untitled Form',
        description: formSettings.description || '',
        elements: formElements,
        status: 'draft'
      };

      console.log('Saving form data:', formData);

      if (formId) {
        // Update existing form
        await axios.patch(`/api/forms/${formId}`, formData);
        console.log('Form updated successfully');
      } else {
        // Create new form
        await axios.post('/api/forms', formData);
        console.log('Form created successfully');
      }

      toast.success('Form saved successfully!');
      navigate('/admin/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error(error.response?.data?.message || 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset the form? All changes will be lost.')) {
      setFormElements([]);
      setFormSettings(defaultFormSettings);
      setSelectedElement(null);
      toast.info('Form has been reset');
    }
  };

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('componentType', type);
    setDraggingComponent(type);

    // Create a drag image to prevent the button from being dragged
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-9999px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = (e) => {
    setDraggingComponent(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.08)';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      const newElement = {
        type: componentType,
        instanceId: uuidv4(),
        settings: {
          ...defaultFieldSettings,
          label: `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Field`,
          options: ['select', 'radio', 'checkbox'].includes(componentType) 
            ? ['Option 1', 'Option 2', 'Option 3'] 
            : undefined,
        },
      };
      setFormElements(prev => [...prev, newElement]);
      setSelectedElement(newElement);
      setShowFormSettings(false);
    }
  };

  const handleReorder = (source, destination) => {
    const items = Array.from(formElements);
    const [removed] = items.splice(source, 1);
    items.splice(destination, 0, removed);
    setFormElements(items);
  };

  const handleUpdateComponent = (updatedComponent) => {
    setFormElements(prev =>
      prev.map(element =>
        element.instanceId === updatedComponent.instanceId ? updatedComponent : element
      )
    );
    setSelectedElement(updatedComponent);
  };

  const handleDeleteComponent = (instanceId) => {
    setFormElements(prev => prev.filter(element => element.instanceId !== instanceId));
    setSelectedElement(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <ToastContainer />
      
      {/* Left Sidebar - Component List */}
      <Box
        sx={{
          width: 250,
          borderRight: 1,
          borderColor: 'divider',
          p: 2,
          bgcolor: 'background.paper',
          overflowY: 'auto',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" gutterBottom>
            Form Components
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              setSelectedElement(null);
              setShowFormSettings(true);
            }}
            startIcon={<SettingsIcon />}
          >
            Form Settings
          </Button>
          <Divider />
          {componentTypes.map((type) => (
            <Button
              key={type.type}
              variant="outlined"
              startIcon={type.icon}
              draggable
              onDragStart={(e) => handleDragStart(e, type.type)}
              onDragEnd={handleDragEnd}
              sx={{
                justifyContent: 'flex-start',
                mb: 1,
                opacity: draggingComponent === type.type ? 0.5 : 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '&:active': {
                  cursor: 'grabbing',
                },
              }}
            >
              {type.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Middle Section - Form Preview */}
      <Box 
        sx={{ 
          flex: 1, 
          p: 3, 
          overflowY: 'auto',
          backgroundColor: 'background.default',
          transition: 'background-color 0.2s',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            minHeight: '100%',
            bgcolor: formSettings.theme === 'dark' ? 'grey.900' : 'background.paper',
          }}
        >
          <Typography variant="h5" gutterBottom>
            {formSettings.title || 'Untitled Form'}
          </Typography>
          {formSettings.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {formSettings.description}
            </Typography>
          )}
          <Box sx={{ minHeight: 100 }}>
            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) return;
                handleReorder(result.source.index, result.destination.index);
              }}
            >
              <Droppable droppableId="form-elements">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {formElements.map((element, index) => (
                      <Draggable
                        key={element.instanceId}
                        draggableId={element.instanceId.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              setSelectedElement(element);
                              setShowFormSettings(false);
                            }}
                            sx={{
                              cursor: 'pointer',
                              position: 'relative',
                              '&:hover': { 
                                '& .element-actions': {
                                  opacity: 1,
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                position: 'relative',
                                mb: 2,
                                border: '1px solid',
                                borderColor: selectedElement?.instanceId === element.instanceId
                                  ? 'primary.main'
                                  : 'divider',
                                borderRadius: 1,
                                bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <Box sx={{ p: 2 }}>
                                <FormElementPreview
                                  element={element}
                                  formElements={formElements}
                                />
                              </Box>
                              <Box
                                className="element-actions"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  bgcolor: 'background.paper',
                                  borderRadius: 1,
                                  boxShadow: 1,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteComponent(element.instanceId);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Paper>
      </Box>

      {/* Right Sidebar - Settings Panel */}
      <Box
        sx={{
          width: 300,
          borderLeft: 1,
          borderColor: 'divider',
          p: 2,
          bgcolor: 'background.paper',
          overflowY: 'auto',
        }}
      >
        {showFormSettings ? (
          <FormSettings
            settings={formSettings}
            onUpdate={setFormSettings}
            onSave={handleSaveForm}
            onReset={handleResetForm}
            isSaving={isSaving}
          />
        ) : selectedElement ? (
          <ComponentSettings
            component={selectedElement}
            onUpdate={handleUpdateComponent}
            onDelete={handleDeleteComponent}
          />
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            Select a component or open form settings to customize
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FormBuilder;
