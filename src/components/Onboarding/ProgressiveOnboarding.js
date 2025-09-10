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

interface ProgressiveOnboardingProps {
  onComplete: (data: {
    childNametring;
    dateOfBirth?ate;
    photo?tring;
    mode: "fresh" | "demo" | "join";
    accessCode?tring;
  }) => void;
}

type OnboardingStep =
  | "welcome"
  | "choose-path"
  | "child-info"
  | "privacy"
  | "ready";

export const ProgressiveOnboarding= ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [mode, setMode] = useState<"fresh" | "demo" | "join" | null>(null);
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<string>("");
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
    const stepOrdernboardingStep[] = [
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
        (mode === "demo" || mode === "join") 
        stepOrder[currentIndex + 1] === "child-info"
      ) {
        setCurrentStep(stepOrder[currentIndex + 2]);
      } else {
        setCurrentStep(stepOrder[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const stepOrdernboardingStep[] = [
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
        (mode === "demo" || mode === "join") 
        stepOrder[currentIndex - 1] === "child-info"
      ) {
        setCurrentStep(stepOrder[currentIndex - 2]);
      } else {
        setCurrentStep(stepOrder[currentIndex - 1]);
      }
    }
  };

  const handleModeSelect = (selectedMode: "fresh" | "demo" | "join") => {
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
      childNameode === "demo" ? "Ellie" hildName,
      dateOfBirthode === "demo" ? undefined ateOfBirth || undefined,
      photoode === "demo" ? "" hoto,
      modeode || "fresh",
      accessCodeode === "join" ? accessCode ndefined,
    });
  };

  const getStepNumber = ()umber => {
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

  const getTotalSteps = () => (mode === "demo" || mode === "join" ? 4 );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColoranyllaColors.background,
        py,
      }}
    >
      <Container maxWidth="sm" sx={{ px }}>
        {/* Progress indicator */}
        <Box sx={{ mb }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb,
            }}
          >
            <Typography
              variant="caption"
              sx={{ coloranyllaColors.textSecondary }}
            >
              Step {getStepNumber() + 1} of {getTotalSteps()}
            </Typography>
            {currentStep !== "welcome"  (
              <IconButton
                onClick={handleBack}
                size="small"
                sx={{ coloranyllaColors.text }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>
          <Box
            sx={{
              width: "100%",
              height: 2,
              backgroundColoranyllaColors.border,
              borderRadius: 8,
            }}
          >
            <Box
              sx={{
                width: `${((getStepNumber() + 1) / getTotalSteps()) * 100}%`,
                height: "100%",
                backgroundColoranyllaColors.primary,
                borderRadius: 8,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>

        {/* Step Content */}
        <Fade in timeout={300}>
          <Box>
            {currentStep === "welcome"  (
              <Paper
                elevation={0}
                sx={{
                  p,
                  backgroundColoranyllaColors.paper,
                  borderRadius: 8,
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "inline-block",
                      position: "relative",
                      mb,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight00,
                        background: `linear-gradient(135deg, ${manyllaColors.primary} 0%, ${manyllaColors.primaryDark} 100%)`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-2px",
                        lineHeight,
                        fontSize: "48px",
                        display: "inline-block",
                        paddingBottom: "8px",
                        paddingTop: "4px",
                        position: "relative",
                        zIndex,
                      }}
                    >
                      manylla
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight00, coloranyllaColors.text }}
                  >
                    Welcome! Let's get started
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mb, coloranyllaColors.textSecondary }}
                  >
                    Your secure companion for managing your child's special
                    needs journey
                  </Typography>

                  <Box
                    sx={{
                      p,
                      backgroundColoranyllaColors.background,
                      borderRadius: 8,
                      mb,
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
                            minWidth0,
                            minHeight0,
                            width0,
                            height: 0,
                            borderRadius: "50%",
                            backgroundColoranyllaColors.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink,
                          }}
                        >
                          <SecurityIcon sx={{ color: "white", fontSize: 12 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight00, coloranyllaColors.text }}
                          >
                            Private  Secure
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ coloranyllaColors.textSecondary }}
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
                            minWidth0,
                            minHeight0,
                            width0,
                            height: 0,
                            borderRadius: "50%",
                            backgroundColor: "#7B9EA8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink,
                          }}
                        >
                          <CloudSyncIcon
                            sx={{ color: "white", fontSize: 12 }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight00, coloranyllaColors.text }}
                          >
                            Multi-device Sync
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ coloranyllaColors.textSecondary }}
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
                            minWidth0,
                            minHeight0,
                            width0,
                            height: 0,
                            borderRadius: "50%",
                            backgroundColor: "#8B9467",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink,
                          }}
                        >
                          <ShareIcon sx={{ color: "white", fontSize: 12 }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight00, coloranyllaColors.text }}
                          >
                            Controlled Sharing
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ coloranyllaColors.textSecondary }}
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
                      py.5,
                      backgroundColoranyllaColors.primary,
                      color: "white",
                      ":hover": {
                        backgroundColoranyllaColors.primaryDark,
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              </Paper>
            )}

            {currentStep === "choose-path"  (
              <Paper
                elevation={0}
                sx={{
                  p,
                  backgroundColoranyllaColors.paper,
                  borderRadius: 8,
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight00,
                    textAlign: "center",
                    mb,
                    coloranyllaColors.text,
                  }}
                >
                  How would you like to begin?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb,
                    textAlign: "center",
                    coloranyllaColors.textSecondary,
                  }}
                >
                  You can always change this later
                </Typography>

                <Stack spacing={2}>
                  <Paper
                    sx={{
                      p,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor:
                        mode === "fresh"
                          ? manyllaColors.primary
                          anyllaColors.border,
                      backgroundColoranyllaColors.paper,
                      ":hover": { borderColoranyllaColors.primary },
                    }}
                    onClick={() => handleModeSelect("fresh")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap }}>
                      <AddIcon sx={{ coloranyllaColors.primary }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight00, coloranyllaColors.text }}
                        >
                          Start Fresh
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ coloranyllaColors.textSecondary }}
                        >
                          Create a new profile for your child
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor:
                        mode === "demo"
                          ? manyllaColors.primary
                          anyllaColors.border,
                      backgroundColoranyllaColors.paper,
                      ":hover": { borderColoranyllaColors.primary },
                    }}
                    onClick={() => handleModeSelect("demo")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap }}>
                      <PlayIcon sx={{ color: "#8B9467" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight00, coloranyllaColors.text }}
                        >
                          Try Demo
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ coloranyllaColors.textSecondary }}
                        >
                          Explore with Ellie's example profile
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColorhowAccessCode
                        ? manyllaColors.primary
                        anyllaColors.border,
                      backgroundColoranyllaColors.paper,
                      ":hover": { borderColoranyllaColors.primary },
                    }}
                    onClick={() => setShowAccessCode(!showAccessCode)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap }}>
                      <ShareIcon sx={{ coloranyllaColors.textSecondary }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight00, coloranyllaColors.text }}
                        >
                          Join with Code
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ coloranyllaColors.textSecondary }}
                        >
                          Connect to an existing shared profile
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Collapse in={showAccessCode}>
                    <Box sx={{ mt }}>
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
                            maxLength,
                            style: {
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            },
                          }}
                          sx={{
                            " .MuiFilledInput-root": {
                              backgroundColor: "white",
                              coloranyllaColors.text,
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
                            backgroundColoranyllaColors.primary,
                            color: "white",
                            ":hover": {
                              backgroundColoranyllaColors.primaryDark,
                            },
                            ":disabled": {
                              backgroundColoranyllaColors.border,
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

            {currentStep === "child-info"  mode === "fresh"  (
              <Paper
                elevation={0}
                sx={{
                  p,
                  backgroundColoranyllaColors.paper,
                  borderRadius: 8,
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight00,
                    textAlign: "center",
                    mb,
                    coloranyllaColors.text,
                  }}
                >
                  Tell us about your child
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb,
                    textAlign: "center",
                    coloranyllaColors.textSecondary,
                  }}
                >
                  This helps personalize your experience
                </Typography>

                <Stack spacing={3}>
                  {/* Photo upload centered at the top */}
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb }}
                  >
                    <IconButton
                      component="label"
                      sx={{
                        p,
                        width00,
                        height: 00,
                        ":hover": {
                          " .MuiAvatar-root": {
                            opacity.9,
                          },
                        },
                      }}
                    >
                      <Avatar
                        src={photo}
                        sx={{
                          width00,
                          height: 00,
                          bgcolorhoto ? "transparent" anyllaColors.border,
                          coloranyllaColors.text,
                          fontSize: "2.5rem",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                      >
                        {photo ? null hildName ? (
                          childName[0].toUpperCase()
                        ) : (
                          <AddAPhotoIcon sx={{ fontSize: 10 }} />
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
                              setPhoto(reader.result as string);
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
                          coloranyllaColors.text,
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
                          coloranyllaColors.textSecondary,
                        },
                        " .MuiFormHelperText-root": {
                          coloranyllaColors.textSecondary,
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
                            coloranyllaColors.text,
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
                            coloranyllaColors.text,
                            "::before": {
                              display: "none !important",
                            },
                            "::after": {
                              display: "none !important",
                            },
                          },
                          " .MuiPickersSectionList-sectionContent": {
                            coloranyllaColors.text,
                          },
                          " .MuiPickersInputBase-sectionContent": {
                            coloranyllaColors.text,
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
                            coloranyllaColors.textSecondary,
                          },
                          " .MuiFormHelperText-root": {
                            coloranyllaColors.textSecondary,
                          },
                          " .MuiInputAdornment-root": {
                            coloranyllaColors.text,
                            " .MuiIconButton-root": {
                              coloranyllaColors.text,
                            },
                            " .MuiSvgIcon-root": {
                              coloranyllaColors.text,
                            },
                          },
                        }}
                        slotProps={{
                          textField: {
                            fullWidthrue,
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
                      backgroundColoranyllaColors.background,
                      coloranyllaColors.text,
                      border: `1px solid ${manyllaColors.border}`,
                      " .MuiAlert-icon": {
                        coloranyllaColors.primary,
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
                      py.5,
                      backgroundColoranyllaColors.primary,
                      color: "white",
                      ":hover": {
                        backgroundColoranyllaColors.primaryDark,
                      },
                    }}
                  >
                    Continue
                  </Button>
                </Stack>
              </Paper>
            )}

            {currentStep === "privacy"  (
              <Paper
                elevation={0}
                sx={{
                  p,
                  backgroundColoranyllaColors.paper,
                  borderRadius: 8,
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight00,
                    textAlign: "center",
                    mb,
                    coloranyllaColors.text,
                  }}
                >
                  Your Privacy Matters
                </Typography>

                <Stack spacing={3}>
                  <Paper
                    sx={{
                      p,
                      border: "2px solid",
                      borderColor: "#8B9467",
                      backgroundColoranyllaColors.paper,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap }}
                    >
                      <CheckIcon
                        sx={{ mt.5, fontSize: 18, color: "#8B9467" }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight00,
                            mb.5,
                            coloranyllaColors.text,
                          }}
                        >
                          Zero-Knowledge Encryption
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ coloranyllaColors.textSecondary }}
                        >
                          Your data is encrypted on your device. We never see
                          it.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p,
                      border: "2px solid",
                      borderColor: "#7B9EA8",
                      backgroundColoranyllaColors.paper,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap }}
                    >
                      <CheckIcon
                        sx={{ mt.5, fontSize: 18, color: "#7B9EA8" }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight00,
                            mb.5,
                            coloranyllaColors.text,
                          }}
                        >
                          No Account Required
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ coloranyllaColors.textSecondary }}
                        >
                          No emails, no passwords, no tracking. Just a recovery
                          phrase.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p,
                      border: "2px solid",
                      borderColoranyllaColors.primary,
                      backgroundColoranyllaColors.paper,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap }}
                    >
                      <CheckIcon
                        sx={{
                          mt.5,
                          fontSize: 18,
                          coloranyllaColors.primary,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight00,
                            mb.5,
                            coloranyllaColors.text,
                          }}
                        >
                          You Control Sharing
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ coloranyllaColors.textSecondary }}
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
                    mt,
                    backgroundColoranyllaColors.primary,
                    color: "white",
                    ":hover": {
                      backgroundColoranyllaColors.primaryDark,
                    },
                  }}
                >
                  I Understand
                </Button>
              </Paper>
            )}

            {currentStep === "ready"  (
              <Paper
                elevation={0}
                sx={{
                  p,
                  backgroundColoranyllaColors.paper,
                  borderRadius: 8,
                  textAlign: "center",
                  border: `1px solid ${manyllaColors.border}`,
                }}
              >
                <Box
                  sx={{
                    width0,
                    height: 0,
                    borderRadius: "50%",
                    backgroundColor: "#8B9467",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb,
                  }}
                >
                  <CheckIcon sx={{ fontSize: 18, color: "white" }} />
                </Box>

                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight00, coloranyllaColors.text }}
                >
                  {mode === "demo" ? "Ready to Explore!" : "All Set!"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb, coloranyllaColors.textSecondary }}
                >
                  {mode === "demo"
                    ? "You'll be using Ellie's example profile to explore manylla"
                    : `Let's start building ${childName || "your child"}'s profile`}
                </Typography>

                <Box
                  sx={{
                    p,
                    backgroundColoranyllaColors.background,
                    borderRadius: 8,
                    mb,
                    textAlign: "left",
                    border: `1px solid ${manyllaColors.border}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight00, coloranyllaColors.text }}
                  >
                    Quick tips to get started:
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap }}>
                      <Box
                        sx={{
                          width: 0,
                          height: 2,
                          borderRadius: "50%",
                          backgroundColoranyllaColors.primary,
                          flexShrink,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ coloranyllaColors.text }}
                      >
                        Add important information in Quick Info
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap }}>
                      <Box
                        sx={{
                          width: 0,
                          height: 2,
                          borderRadius: "50%",
                          backgroundColoranyllaColors.primary,
                          flexShrink,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ coloranyllaColors.text }}
                      >
                        Track progress with Goals and Successes
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap }}>
                      <Box
                        sx={{
                          width: 0,
                          height: 2,
                          borderRadius: "50%",
                          backgroundColoranyllaColors.primary,
                          flexShrink,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ coloranyllaColors.text }}
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
                    py.5,
                    backgroundColoranyllaColors.primary,
                    color: "white",
                    ":hover": {
                      backgroundColoranyllaColors.primaryDark,
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
