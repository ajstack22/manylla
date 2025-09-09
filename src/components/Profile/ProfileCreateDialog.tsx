import React, { useState, useRef } from "react";
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
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { manyllaColors } from "../../theme/theme";
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import { ChildProfile } from "../../types/ChildProfile";
import { useMobileDialog } from "../../hooks/useMobileDialog";
import { defaultCategories } from "../../utils/defaultCategories";
import { defaultQuickInfoPanels } from "../../utils/defaultQuickInfo";

interface ProfileCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (profile: ChildProfile) => void;
}

export const ProfileCreateDialog: React.FC<ProfileCreateDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    preferredName: "",
    dateOfBirth: new Date(),
    pronouns: "",
    photo: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string>("");

  const steps = ["Basic Info", "Photo"];

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

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Create the profile
      const newProfile: ChildProfile = {
        id: Date.now().toString(),
        ...formData,
        entries: [],
        categories: defaultCategories,
        themeMode: "light",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      onCreate(newProfile);
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const canProceed = () => {
    if (activeStep === 0) {
      return formData.name.trim() !== "";
    }
    return true;
  };

  const calculateAge = (dob: Date) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
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
              Create Profile
            </Typography>
            <IconButton edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>Create New Profile</DialogTitle>
      )}

      <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Stack spacing={3}>
            <TextField
              label="Child's Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              required
              autoFocus
            />

            <TextField
              label="Preferred Name (Optional)"
              value={formData.preferredName}
              onChange={(e) =>
                setFormData({ ...formData, preferredName: e.target.value })
              }
              fullWidth
              helperText="What they like to be called"
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
                    InputProps: {
                      endAdornment: <CalendarIcon />,
                    },
                    helperText: `Age: ${calculateAge(formData.dateOfBirth)} years`,
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              label="Pronouns (Optional)"
              value={formData.pronouns}
              onChange={(e) =>
                setFormData({ ...formData, pronouns: e.target.value })
              }
              fullWidth
              placeholder="e.g., she/her, he/him, they/them"
            />
          </Stack>
        )}

        {activeStep === 1 && (
          <Stack spacing={3}>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              Add a photo to personalize the profile (optional)
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={photoPreview}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: photoPreview
                    ? "transparent"
                    : manyllaColors.avatarDefaultBg,
                  color: photoPreview ? "inherit" : "white",
                  fontSize: "3rem",
                }}
              >
                {formData.name.charAt(0).toUpperCase()}
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? "Change Photo" : "Add Photo"}
              </Button>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {activeStep === steps.length - 1 ? "Create Profile" : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
