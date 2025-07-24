import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Entry } from '../../types/ChildProfile';
import { useMobileDialog } from '../../hooks/useMobileDialog';

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
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    description: entry?.description || '',
    visibility: entry?.visibility || 'private',
  });

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
        <AppBar position="sticky" color="default" elevation={0}>
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
        <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              autoFocus
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
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
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {entry ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};