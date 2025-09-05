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
  Paper,
} from '@mui/material';
import { manyllaColors } from '../../theme/theme';
import { modalTheme, getModalDialogProps } from '../../theme/modalTheme';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
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
    <Dialog open={open} onClose={onClose} {...getModalDialogProps(isMobile)}>
      {isMobile ? (
        <AppBar position="sticky" color="default" elevation={0}>
          <Toolbar>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Edit Profile
            </Typography>
            <IconButton edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Edit Profile
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}
      
      <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
        {!isMobile && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Edit Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update your child's profile information
            </Typography>
          </Box>
        )}
        <Stack spacing={2}>
          {/* Profile Photo */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Avatar
              src={photoPreview}
              sx={{ 
                width: 100, 
                height: 100, 
                mb: 2, 
                mx: 'auto',
                bgcolor: photoPreview ? 'transparent' : manyllaColors.avatarDefaultBg,
                color: photoPreview ? 'inherit' : 'white',
                fontSize: '2.5rem',
              }}
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
              size="small"
            >
              Change Photo
            </Button>
          </Paper>

          {/* Basic Information */}
          <Paper {...modalTheme.panel}>
            <Stack spacing={2}>
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                {...modalTheme.textField}
              />
              
              <TextField
                label="Preferred Name"
                value={formData.preferredName}
                onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                fullWidth
                helperText="What they like to be called"
                size="small"
              />

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
                      size: 'small',
                      InputProps: {
                        endAdornment: <CalendarIcon fontSize="small" />,
                      },
                      helperText: `Age: ${calculateAge(formData.dateOfBirth)} years`,
                    },
                  }}
                />
              </LocalizationProvider>

              <TextField
                label="Pronouns"
                value={formData.pronouns}
                onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                fullWidth
                placeholder="e.g., she/her, he/him, they/them"
                size="small"
              />
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 2, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};