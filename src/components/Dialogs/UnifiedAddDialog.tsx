import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
// Removed react-colorful import - using built-in color input instead
import { QuickInfoConfig, CategoryConfig } from '../../types/ChildProfile';
import { useMobileDialog } from '../../hooks/useMobileDialog';
import { MarkdownField } from '../Forms/MarkdownField';

interface UnifiedAddDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'quickInfo' | 'category';
  onAdd: (data: Partial<QuickInfoConfig> | Partial<CategoryConfig>) => void;
  existingItems?: QuickInfoConfig[] | CategoryConfig[];
}

const predefinedQuickInfoOptions = [
  'Communication',
  'Sensory',
  'Medical',
  'Dietary',
  'Emergency',
  'Medications',
  'Allergies',
  'Behaviors',
  'Triggers',
  'Calming Strategies',
  'Sleep',
  'Daily Routine',
  'Custom...'
];

const defaultColors = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
  '#9B59B6', '#1ABC9C', '#E67E22', '#34495E',
  '#16A085', '#27AE60', '#8E44AD', '#2980B9'
];

export const UnifiedAddDialog: React.FC<UnifiedAddDialogProps> = ({
  open,
  onClose,
  mode,
  onAdd,
  existingItems = [],
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  // Quick Info state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [value, setValue] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<string>('all');

  // Category state
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3498DB');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleReset = () => {
    setSelectedOption('');
    setCustomName('');
    setValue('');
    setPrivacyLevel('all');
    setCategoryName('');
    setCategoryColor('#3498DB');
    setShowColorPicker(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAdd = () => {
    if (mode === 'quickInfo') {
      const displayName = selectedOption === 'Custom...' ? customName : selectedOption;
      const name = displayName.toLowerCase().replace(/\s+/g, '-');
      
      if (displayName && value) {
        onAdd({
          id: `custom-${Date.now()}`,
          name,
          displayName,
          value,
          order: existingItems.length + 1,
          isVisible: true,
          isCustom: true,
        } as Partial<QuickInfoConfig>);
        handleClose();
      }
    } else {
      if (categoryName && categoryColor) {
        onAdd({
          id: `custom-${Date.now()}`,
          name: categoryName.toLowerCase().replace(/\s+/g, '-'),
          displayName: categoryName,
          color: categoryColor,
          order: existingItems.length + 1,
          isVisible: true,
          isCustom: true,
        } as Partial<CategoryConfig>);
        handleClose();
      }
    }
  };

  const isValid = mode === 'quickInfo' 
    ? (selectedOption && (selectedOption !== 'Custom...' || customName) && value)
    : (categoryName && categoryColor);

  return (
    <Dialog open={open} onClose={handleClose} {...mobileDialogProps}>
      {isMobile ? (
        <AppBar position="sticky" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Add {mode === 'quickInfo' ? 'Quick Info' : 'Category'}
            </Typography>
            <IconButton edge="end" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>
          Add New {mode === 'quickInfo' ? 'Quick Info' : 'Category'}
        </DialogTitle>
      )}
      <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
        <Box sx={{ pt: 2 }}>
          {mode === 'quickInfo' ? (
            <Stack spacing={3}>
              <FormControl fullWidth>
                <Autocomplete
                  value={selectedOption}
                  onChange={(_, newValue) => setSelectedOption(newValue || '')}
                  options={predefinedQuickInfoOptions}
                  renderInput={(params) => (
                    <TextField {...params} label="Select or create type" />
                  )}
                  freeSolo
                  onInputChange={(_, newInputValue) => {
                    if (!predefinedQuickInfoOptions.includes(newInputValue) && newInputValue !== '') {
                      setSelectedOption('Custom...');
                      setCustomName(newInputValue);
                    }
                  }}
                />
              </FormControl>

              {selectedOption === 'Custom...' && (
                <TextField
                  label="Custom panel name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  fullWidth
                  placeholder="Enter custom name"
                />
              )}

              <MarkdownField
                label="Information"
                value={value}
                onChange={(newValue) => setValue(newValue)}
                placeholder="Enter the information to display"
                height={150}
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Privacy Level
                </Typography>
                <ToggleButtonGroup
                  value={privacyLevel}
                  exclusive
                  onChange={(_, newValue) => newValue && setPrivacyLevel(newValue)}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value="private">Private</ToggleButton>
                  <ToggleButton value="family">Family</ToggleButton>
                  <ToggleButton value="medical">Medical</ToggleButton>
                  <ToggleButton value="education">Education</ToggleButton>
                  <ToggleButton value="all">All</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <TextField
                label="Category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                fullWidth
                placeholder="Enter category name"
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Category Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {defaultColors.map((color) => (
                    <Box
                      key={color}
                      onClick={() => setCategoryColor(color)}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: categoryColor === color ? '3px solid #000' : '1px solid #ddd',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  ))}
                  <Box
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: '1px solid #ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                      +
                    </Typography>
                  </Box>
                </Box>

                {showColorPicker && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={categoryColor}
                      onChange={(e) => setCategoryColor(e.target.value)}
                      style={{ 
                        width: '60px', 
                        height: '40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                    <TextField
                      value={categoryColor}
                      onChange={(e) => setCategoryColor(e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                      placeholder="#000000"
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: categoryColor,
                    color: 'white',
                    textAlign: 'center',
                    mt: 2,
                  }}
                >
                  <Typography variant="body2">
                    Preview: {categoryName || 'Category Name'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} disabled={!isValid}>
          Add {mode === 'quickInfo' ? 'Quick Info' : 'Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};