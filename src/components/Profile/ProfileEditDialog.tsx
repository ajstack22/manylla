import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Typography,
  Stack,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import { ChildProfile } from '../../types/ChildProfile';
import { useMobileDialog } from '../../hooks/useMobileDialog';

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  profile: ChildProfile;
  onSave: (updates: Partial<ChildProfile>) => void;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  open,
  onClose,
  profile,
  onSave,
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: profile.name,
    preferredName: profile.preferredName,
    dateOfBirth: profile.dateOfBirth,
    pronouns: profile.pronouns,
    photo: profile.photo,
  });
  
  const [photoPreview, setPhotoPreview] = useState<string>(profile.photo || '');

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData({ ...formData, photo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      updatedAt: new Date(),
    });
    onClose();
  };

  const calculateAge = (dob: Date) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Dialog open={open} onClose={onClose} {...mobileDialogProps}>
      {isMobile ? (
        <AppBar position="sticky" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Edit Profile
            </Typography>
            <IconButton edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>Edit Profile</DialogTitle>
      )}
      
      <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
        <Stack spacing={3}>
          {/* Profile Photo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={photoPreview}
              sx={{ width: 120, height: 120, mb: 2 }}
            >
              {formData.name.charAt(0)}
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>
          </Box>

          {/* Name Fields */}
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          
          <TextField
            label="Preferred Name"
            value={formData.preferredName}
            onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
            fullWidth
            helperText="What they like to be called"
          />

          {/* Date of Birth */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  setFormData({ ...formData, dateOfBirth: newValue });
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    endAdornment: <CalendarIcon />,
                  },
                  helperText: `Age: ${calculateAge(formData.dateOfBirth)} years`,
                },
              }}
            />
          </LocalizationProvider>

          {/* Pronouns */}
          <TextField
            label="Pronouns"
            value={formData.pronouns}
            onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
            fullWidth
            placeholder="e.g., she/her, he/him, they/them"
          />
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};