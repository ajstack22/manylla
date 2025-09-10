import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Stack,
  Fade,
  Slide,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Collapse,
  Alert,
  Avatar,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Share as ShareIcon,
  PlayCircle as PlayIcon,
  Security as SecurityIcon,
  CloudSync as CloudSyncIcon,
  Check as CheckIcon,
  Cake as CakeIcon,
  CameraAlt as CameraAltIcon,
  AddAPhoto as AddAPhotoIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export const ProgressiveOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState("welcome");
  const [mode, setMode] = useState(null);
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [photo, setPhoto] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [nameError, setNameError] = useState(false);

  // Always use Manylla theme colors for onboarding
  const manyllaColors = {
    background: "#C4A66B", // Actual manila envelope color
    paper: "#D4B896", // Lighter manila for cards
    text: "#3D2F1F", // Dark brown text
    textSecondary: "#5D4A37", // Medium brown for secondary text
    border: "#A68B5B", // Darker manila for borders
    primary: "#8B7355", // Medium brown for primary actions
    primaryDark: "#6B5745", // Darker brown for hover states
  };

  const handleNext = () => {
    const stepOrder = [
      "welcome",
      "choose-path",
      "child-info",
      "privacy",
      "ready",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      // Skip child-info if demo mode or join mode
      if (
        (mode === "demo" || mode === "join") &&
        stepOrder[currentIndex + 1] === "child-info"
      ) {
        setCurrentStep(stepOrder[currentIndex + 2]);
      } else {
        setCurrentStep(stepOrder[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const stepOrder = [
      "welcome",
      "choose-path",
      "child-info",
      "privacy",
      "ready",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      // Skip child-info if demo mode or join mode when going back
      if (
        (mode === "demo" || mode === "join") &&
        stepOrder[currentIndex - 1] === "child-info"
      ) {
        setCurrentStep(stepOrder[currentIndex - 2]);
      } else {
        setCurrentStep(stepOrder[currentIndex - 1]);
      }
    }
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === "join") {
      setShowAccessCode(true);
    } else if (selectedMode === "demo") {
      // For demo mode, skip directly to privacy step
      setCurrentStep("privacy");
    } else {
      // For fresh mode, go to child-info step
      setCurrentStep("child-info");
    }
  };

  const handleJoinWithCode = () => {
    if (accessCode.length === 6) {
      setMode("join");
      setCurrentStep("privacy"); // Skip directly to privacy step for join mode
    }
  };

  const handleFinish = () => {
    onComplete({
      childName: mode === "demo" ? "Ellie" : childName,
      dateOfBirth: mode === "demo" ? undefined : dateOfBirth || undefined,
      photo: mode === "demo" ? "" : photo,
      mode: mode || "fresh",
      accessCode: mode === "join" ? accessCode : undefined,
    });
  };

  const getStepNumber = () => {
    if (mode === "demo" || mode === "join") {
      switch (currentStep) {
        case "welcome":
          return 0;
        case "choose-path":
          return 1;
        case "privacy":
          return 2;
        case "ready":
          return 3;
        default:
          return 0;
      }
    }
    switch (currentStep) {
      case "welcome":
        return 0;
      case "choose-path":
        return 1;
      case "child-info":
        return 2;
      case "privacy":
        return 3;
      case "ready":
        return 4;
      default:
        return 0;
    }
  };

  const getTotalSteps = () => (mode === "demo" || mode === "join" ? 4 : 5);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: manyllaColors.background,
        py: 4,
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2 }}>
        {/* Progress indicator */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: manyllaColors.textSecondary }}
            >
              Step {getStepNumber() + 1} of {getTotalSteps()}
            </Typography>
            {currentStep !== "welcome" && (
              <IconButton
                onClick={handleBack}
                size="small"
                sx={{ color: manyllaColors.text }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>
          <Box
            sx={{
              width: "100%",
              height: 2,
              backgroundColor: manyllaColors.border,
              borderRadius: 8,
            }}
          >
            <Box
              sx={{
                width: `${((getStepNumber() + 1) / getTotalSteps()) * 100}%`,
                height: "100%",
                backgroundColor: manyllaColors.primary,
                borderRadius: 8,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>

        {/* Step Content */}
        <Fade in timeout={300}>
          <Box>
            {currentStep === "welcome" && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: manyllaColors.paper,
                  borderRadius: 8,
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "inline-block",
                      position: "relative",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${manyllaColors.primary} 0%, ${manyllaColors.primaryDark} 100%)`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-2px",
                        lineHeight: 1,
                        fontSize: "48px",
                        display: "inline-block",
                        paddingBottom: "8px",
                        paddingTop: "4px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      manylla
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600, color: manyllaColors.text }}
                  >
                    Welcome! Let's get started
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mb: 2, color: manyllaColors.textSecondary }}
                  >
                    Your secure companion for managing your child's special
                    needs journey
                  </Typography>

                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: manyllaColors.background,
                      borderRadius: 8,
                      mb: 2,
                      border: `1px solid ${manyllaColors.border}`,
                    }}
                  >
                    <Stack spacing={2.5} sx={{ textAlign: "left" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 30,
                            minHeight: 30,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            backgroundColor: manyllaColors.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <SecurityIcon sx={{ color: "white", fontSize: 12 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: manyllaColors.text }}
                          >
                            Private Secure
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: manyllaColors.textSecondary }}
                          >
                            Your data never leaves your device without
                            encryption
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 30,
                            minHeight: 30,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            backgroundColor: "#7B9EA8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CloudSyncIcon
                            sx={{ color: "white", fontSize: 12 }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: manyllaColors.text }}
                          >
                            Multi-device Sync
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: manyllaColors.textSecondary }}
                          >
                            Access from anywhere with your recovery phrase
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 30,
                            minHeight: 30,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            backgroundColor: "#8B9467",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <ShareIcon sx={{ color: "white", fontSize: 12 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: manyllaColors.text }}
                          >
                            Controlled Sharing
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: manyllaColors.textSecondary }}
                          >
                            Share only what you want, when you want
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    fullWidth
                    sx={{
                      py: 1.5,
                      backgroundColor: manyllaColors.primary,
                      color: "white",
                      ":hover": {
                        backgroundColor: manyllaColors.primaryDark,
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              </Paper>
            )}

            {currentStep === "choose-path" && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: manyllaColors.paper,
                  borderRadius: 8,
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    mb: 2,
                    color: manyllaColors.text,
                  }}
                >
                  How would you like to begin?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    textAlign: "center",
                    color: manyllaColors.textSecondary,
                  }}
                >
                  You can always change this later
                </Typography>

                <Stack spacing={2}>
                  <Paper
                    sx={{
                      p: 3,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor:
                        mode === "fresh"
                          ? manyllaColors.primary
                          : manyllaColors.border,
                      backgroundColor: manyllaColors.paper,
                      ":hover": { borderColor: manyllaColors.primary },
                    }}
                    onClick={() => handleModeSelect("fresh")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <AddIcon sx={{ color: manyllaColors.primary }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: manyllaColors.text }}
                        >
                          Start Fresh
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: manyllaColors.textSecondary }}
                        >
                          Create a new profile for your child
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor:
                        mode === "demo"
                          ? manyllaColors.primary
                          : manyllaColors.border,
                      backgroundColor: manyllaColors.paper,
                      ":hover": { borderColor: manyllaColors.primary },
                    }}
                    onClick={() => handleModeSelect("demo")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <PlayIcon sx={{ color: "#8B9467" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: manyllaColors.text }}
                        >
                          Try Demo
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: manyllaColors.textSecondary }}
                        >
                          Explore with Ellie's example profile
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: showAccessCode
                        ? manyllaColors.primary
                        : manyllaColors.border,
                      backgroundColor: manyllaColors.paper,
                      ":hover": { borderColor: manyllaColors.primary },
                    }}
                    onClick={() => setShowAccessCode(!showAccessCode)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <ShareIcon sx={{ color: manyllaColors.textSecondary }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: manyllaColors.text }}
                        >
                          Join with Code
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: manyllaColors.textSecondary }}
                        >
                          Connect to an existing shared profile
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Collapse in={showAccessCode}>
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          value={accessCode}
                          onChange={(e) =>
                            setAccessCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter 6-digit code"
                          fullWidth
                          size="small"
                          variant="filled"
                          inputProps={{
                            maxLength: 6,
                            style: {
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            },
                          }}
                          sx={{
                            " .MuiFilledInput-root": {
                              backgroundColor: "white",
                              color: manyllaColors.text,
                              ":hover": {
                                backgroundColor: "white",
                              },
                              ".Mui-focused": {
                                backgroundColor: "white",
                              },
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleJoinWithCode}
                          disabled={accessCode.length !== 6}
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            backgroundColor: manyllaColors.primary,
                            color: "white",
                            ":hover": {
                              backgroundColor: manyllaColors.primaryDark,
                            },
                            ":disabled": {
                              backgroundColor: manyllaColors.border,
                            },
                          }}
                        >
                          Join
                        </Button>
                      </Stack>
                    </Box>
                  </Collapse>
                </Stack>
              </Paper>
            )}

            {currentStep === "child-info" && mode === "fresh" && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: manyllaColors.paper,
                  borderRadius: 8,
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    mb: 2,
                    color: manyllaColors.text,
                  }}
                >
                  Tell us about your child
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    textAlign: "center",
                    color: manyllaColors.textSecondary,
                  }}
                >
                  This helps personalize your experience
                </Typography>

                <Stack spacing={3}>
                  {/* Photo upload centered at the top */}
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <IconButton
                      component="label"
                      sx={{
                        p: 0,
                        width: 100,
                        height: 100,
                        ":hover": {
                          " .MuiAvatar-root": {
                            opacity: 0.9,
                          },
                        },
                      }}
                    >
                      <Avatar
                        src={photo}
                        sx={{
                          width: 100,
                          height: 100,
                          bgcolor: photo ? "transparent" : manyllaColors.border,
                          color: manyllaColors.text,
                          fontSize: "2.5rem",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                      >
                        {photo ? null : childName ? (
                          childName[0].toUpperCase()
                        ) : (
                          <AddAPhotoIcon sx={{ fontSize: 40 }} />
                        )}
                      </Avatar>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPhoto(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 8,
                    }}
                  >
                    <TextField
                      label="Child's Name"
                      value={childName}
                      onChange={(e) => {
                        setChildName(e.target.value);
                        setNameError(false);
                      }}
                      fullWidth
                      required
                      error={nameError}
                      helperText={
                        nameError
                          ? "Child's name is required"
                          : "This is how your child will be identified in the app"
                      }
                      autoFocus
                      variant="filled"
                      sx={{
                        " .MuiFilledInput-root": {
                          backgroundColor: "white",
                          color: manyllaColors.text,
                          borderRadius: "12px",
                          ":hover": {
                            backgroundColor: "white",
                          },
                          ".Mui-focused": {
                            backgroundColor: "white",
                          },
                          ":before, :after": {
                            display: "none",
                          },
                        },
                        " .MuiInputLabel-root": {
                          color: manyllaColors.textSecondary,
                        },
                        " .MuiFormHelperText-root": {
                          color: manyllaColors.textSecondary,
                        },
                      }}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date of Birth (optional)"
                        value={dateOfBirth}
                        onChange={(newValue) => setDateOfBirth(newValue)}
                        sx={{
                          width: "100%",
                          " .MuiPickersFilledInput-root": {
                            backgroundColor: "white !important",
                            borderRadius: "12px",
                            color: manyllaColors.text,
                            ":hover": {
                              backgroundColor: "white !important",
                            },
                            ".Mui-focused": {
                              backgroundColor: "white !important",
                            },
                            "::before": {
                              display: "none !important",
                            },
                            "::after": {
                              display: "none !important",
                            },
                          },
                          " .MuiPickersInputBase-root": {
                            backgroundColor: "white !important",
                            borderRadius: "12px",
                            color: manyllaColors.text,
                            "::before": {
                              display: "none !important",
                            },
                            "::after": {
                              display: "none !important",
                            },
                          },
                          " .MuiPickersSectionList-sectionContent": {
                            color: manyllaColors.text,
                          },
                          " .MuiPickersInputBase-sectionContent": {
                            color: manyllaColors.text,
                          },
                          " .MuiPickersFilledInput-underline": {
                            ":before": {
                              display: "none !important",
                            },
                            ":after": {
                              display: "none !important",
                            },
                          },
                          " .MuiInputLabel-root": {
                            color: manyllaColors.textSecondary,
                          },
                          " .MuiFormHelperText-root": {
                            color: manyllaColors.textSecondary,
                          },
                          " .MuiInputAdornment-root": {
                            color: manyllaColors.text,
                            " .MuiIconButton-root": {
                              color: manyllaColors.text,
                            },
                            " .MuiSvgIcon-root": {
                              color: manyllaColors.text,
                            },
                          },
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: "filled",
                            helperText:
                              "Helps track age-appropriate information",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>

                  <Alert
                    severity="info"
                    icon={<SecurityIcon />}
                    sx={{
                      backgroundColor: manyllaColors.background,
                      color: manyllaColors.text,
                      border: `1px solid ${manyllaColors.border}`,
                      " .MuiAlert-icon": {
                        color: manyllaColors.primary,
                      },
                    }}
                  >
                    This information stays on your device and is never shared
                    without your permission
                  </Alert>

                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => {
                      if (!childName.trim()) {
                        setNameError(true);
                      } else {
                        handleNext();
                      }
                    }}
                    fullWidth
                    sx={{
                      py: 1.5,
                      backgroundColor: manyllaColors.primary,
                      color: "white",
                      ":hover": {
                        backgroundColor: manyllaColors.primaryDark,
                      },
                    }}
                  >
                    Continue
                  </Button>
                </Stack>
              </Paper>
            )}

            {currentStep === "privacy" && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: manyllaColors.paper,
                  borderRadius: 8,
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    mb: 2,
                    color: manyllaColors.text,
                  }}
                >
                  Your Privacy Matters
                </Typography>

                <Stack spacing={3}>
                  <Paper
                    sx={{
                      p: 3,
                      border: "2px solid",
                      borderColor: "#8B9467",
                      backgroundColor: manyllaColors.paper,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <CheckIcon
                        sx={{ mt: 2.5, fontSize: 18, color: "#8B9467" }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: manyllaColors.text,
                          }}
                        >
                          Zero-Knowledge Encryption
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: manyllaColors.textSecondary }}
                        >
                          Your data is encrypted on your device. We never see
                          it.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      border: "2px solid",
                      borderColor: "#7B9EA8",
                      backgroundColor: manyllaColors.paper,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <CheckIcon
                        sx={{ mt: 2.5, fontSize: 18, color: "#7B9EA8" }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: manyllaColors.text,
                          }}
                        >
                          No Account Required
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: manyllaColors.textSecondary }}
                        >
                          No emails, no passwords, no tracking. Just a recovery
                          phrase.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      border: "2px solid",
                      borderColor: manyllaColors.primary,
                      backgroundColor: manyllaColors.paper,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <CheckIcon
                        sx={{
                          mt: 0.5,
                          fontSize: 18,
                          color: manyllaColors.primary,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: manyllaColors.text,
                          }}
                        >
                          You Control Sharing
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: manyllaColors.textSecondary }}
                        >
                          Share specific information with time limits and access
                          codes.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  fullWidth
                  sx={{
                    mt: 2,
                    backgroundColor: manyllaColors.primary,
                    color: "white",
                    ":hover": {
                      backgroundColor: manyllaColors.primaryDark,
                    },
                  }}
                >
                  I Understand
                </Button>
              </Paper>
            )}

            {currentStep === "ready" && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: manyllaColors.paper,
                  borderRadius: 8,
                  textAlign: "center",
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    backgroundColor: "#8B9467",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb: 2,
                  }}
                >
                  <CheckIcon sx={{ fontSize: 18, color: "white" }} />
                </Box>

                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 600, color: manyllaColors.text }}
                >
                  {mode === "demo" ? "Ready to Explore!" : "All Set!"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 2, color: manyllaColors.textSecondary }}
                >
                  {mode === "demo"
                    ? "You'll be using Ellie's example profile to explore manylla"
                    : `Let's start building ${childName || "your child"}'s profile`}
                </Typography>

                <Box
                  sx={{
                    p: 3,
                    backgroundColor: manyllaColors.background,
                    borderRadius: 8,
                    mb: 2,
                    textAlign: "left",
                    border: `1px solid ${manyllaColors.border}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: 600, color: manyllaColors.text }}
                  >
                    Quick tips to get started:
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 2,
                          borderRadius: "50%",
                          backgroundColor: manyllaColors.primary,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: manyllaColors.text }}
                      >
                        Add important information in Quick Info
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 2,
                          borderRadius: "50%",
                          backgroundColor: manyllaColors.primary,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: manyllaColors.text }}
                      >
                        Track progress with Goals and Successes
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 2,
                          borderRadius: "50%",
                          backgroundColor: manyllaColors.primary,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: manyllaColors.text }}
                      >
                        Enable sync to access from other devices
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleFinish}
                  fullWidth
                  sx={{
                    py: 1.5,
                    backgroundColor: manyllaColors.primary,
                    color: "white",
                    ":hover": {
                      backgroundColor: manyllaColors.primaryDark,
                    },
                  }}
                >
                  {mode === "demo" ? "Start Demo" : "Start Using manylla"}
                </Button>
              </Paper>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};
