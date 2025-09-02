import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Entry } from '../../types/ChildProfile';
import { useMobileDialog } from '../../hooks/useMobileDialog';
import { useMobileKeyboard } from '../../hooks/useMobileKeyboard';
import { RichTextInput } from './RichTextInput';
import { getPlaceholder, getRandomExample } from '../../utils/placeholders';

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: Omit<Entry, 'id'>) => void;
  category: string;
  entry?: Entry;
}

const visibilityOptions = [
  { value: 'private', label: 'Private' },
  { value: 'family', label: 'Family' },
  { value: 'medical', label: 'Medical Team' },
  { value: 'education', label: 'Education Team' },
  { value: 'all', label: 'Everyone' },
];

export const EntryForm: React.FC<EntryFormProps> = ({
  open,
  onClose,
  onSave,
  category,
  entry,
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const { keyboardPadding, isKeyboardVisible } = useMobileKeyboard();
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    description: entry?.description || '',
    visibility: entry?.visibility || 'private',
  });

  // Reset form data when modal opens/closes or entry changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: entry?.title || '',
        description: entry?.description || '',
        visibility: entry?.visibility || 'private',
      });
    } else {
      // Clear form data when modal closes
      setFormData({
        title: '',
        description: '',
        visibility: 'private',
      });
    }
  }, [open, entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      category,
      date: new Date(),
      visibility: formData.visibility as Entry['visibility'],
    });
    onClose();
  };


  const getCategoryTitle = () => {
    // Convert category name to title case
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={open} onClose={onClose} {...mobileDialogProps}>
      {isMobile ? (
        <AppBar 
          position="sticky" 
          color="default" 
          elevation={0}
          sx={{
            // Keep header visible above keyboard
            zIndex: isKeyboardVisible ? 1100 : 'auto',
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {entry ? 'Edit' : 'Add'} {getCategoryTitle()}
            </Typography>
            <IconButton edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {entry ? 'Edit' : 'Add'} {getCategoryTitle()}
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}
      <form onSubmit={handleSubmit}>
        <DialogContent 
          sx={{ 
            pt: isMobile ? 2 : 3,
            pb: isMobile && isKeyboardVisible ? `${keyboardPadding + 80}px` : 3,
          }}
        >
          <Stack spacing={3}>
            <RichTextInput
              label="Title"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              required
              placeholder={getPlaceholder(category, 'title')}
              multiline={false}
              autoFocus={!entry}
            />
            
            <RichTextInput
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              required
              placeholder={getPlaceholder(category, 'description')}
              helperText={`Example: ${getRandomExample(category) || 'Add details here'}`}
              rows={4}
            />
            
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                label="Visibility"
              >
                {visibilityOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 2 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              minHeight: 44,
              minWidth: 80,
              fontSize: '16px'
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{ 
              minHeight: 44,
              minWidth: 100,
              fontSize: '16px'
            }}
          >
            {entry ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};