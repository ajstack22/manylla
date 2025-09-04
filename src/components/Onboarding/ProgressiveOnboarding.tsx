import React, { useState } from 'react';
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
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Share as ShareIcon,
  PlayCircle as PlayIcon,
  Security as SecurityIcon,
  CloudSync as CloudSyncIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

interface ProgressiveOnboardingProps {
  onComplete: (data: {
    childName: string;
    preferredName?: string;
    mode: 'fresh' | 'demo' | 'join';
    accessCode?: string;
  }) => void;
}

type OnboardingStep = 'welcome' | 'choose-path' | 'child-info' | 'privacy' | 'ready';

export const ProgressiveOnboarding: React.FC<ProgressiveOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [mode, setMode] = useState<'fresh' | 'demo' | 'join' | null>(null);
  const [childName, setChildName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [nameError, setNameError] = useState(false);

  const handleNext = () => {
    const stepOrder: OnboardingStep[] = ['welcome', 'choose-path', 'child-info', 'privacy', 'ready'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      // Skip child-info if demo mode
      if (mode === 'demo' && stepOrder[currentIndex + 1] === 'child-info') {
        setCurrentStep(stepOrder[currentIndex + 2]);
      } else {
        setCurrentStep(stepOrder[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const stepOrder: OnboardingStep[] = ['welcome', 'choose-path', 'child-info', 'privacy', 'ready'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      // Skip child-info if demo mode when going back
      if (mode === 'demo' && stepOrder[currentIndex - 1] === 'child-info') {
        setCurrentStep(stepOrder[currentIndex - 2]);
      } else {
        setCurrentStep(stepOrder[currentIndex - 1]);
      }
    }
  };

  const handleModeSelect = (selectedMode: 'fresh' | 'demo' | 'join') => {
    setMode(selectedMode);
    if (selectedMode === 'join') {
      setShowAccessCode(true);
    } else if (selectedMode === 'demo') {
      // For demo mode, skip directly to privacy step
      setCurrentStep('privacy');
    } else {
      // For fresh mode, go to child-info step
      setCurrentStep('child-info');
    }
  };

  const handleJoinWithCode = () => {
    if (accessCode.length === 6) {
      handleNext();
    }
  };

  const handleFinish = () => {
    onComplete({
      childName: mode === 'demo' ? 'Ellie' : childName,
      preferredName: mode === 'demo' ? 'Ellie' : preferredName,
      mode: mode || 'fresh',
      accessCode: mode === 'join' ? accessCode : undefined,
    });
  };

  const getStepNumber = (): number => {
    if (mode === 'demo') {
      switch (currentStep) {
        case 'welcome': return 0;
        case 'choose-path': return 1;
        case 'privacy': return 2;
        case 'ready': return 3;
        default: return 0;
      }
    }
    switch (currentStep) {
      case 'welcome': return 0;
      case 'choose-path': return 1;
      case 'child-info': return 2;
      case 'privacy': return 3;
      case 'ready': return 4;
      default: return 0;
    }
  };

  const getTotalSteps = () => mode === 'demo' ? 4 : 5;

  return (
    <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
      {/* Progress indicator */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Step {getStepNumber() + 1} of {getTotalSteps()}
          </Typography>
          {currentStep !== 'welcome' && (
            <IconButton onClick={handleBack} size="small">
              <ArrowBackIcon />
            </IconButton>
          )}
        </Box>
        <Box sx={{ width: '100%', height: 4, backgroundColor: 'action.hover', borderRadius: 2 }}>
          <Box
            sx={{
              width: `${((getStepNumber() + 1) / getTotalSteps()) * 100}%`,
              height: '100%',
              backgroundColor: 'primary.main',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
      </Box>

      {/* Step Content */}
      <Fade in timeout={300}>
        <Box>
          {currentStep === 'welcome' && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                backgroundColor: 'background.paper',
                borderRadius: 3,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={(theme) => ({
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-2px',
                    lineHeight: 1,
                    fontSize: '48px',
                    display: 'inline-block',
                    paddingBottom: '8px',
                    paddingTop: '4px',
                    mb: 3,
                  })}
                >
                  manylla
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Welcome! Let's get started
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Your secure companion for managing your child's special needs journey
                </Typography>
                
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'action.hover', 
                  borderRadius: 2, 
                  mb: 4 
                }}>
                  <Stack spacing={2.5} sx={{ textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{
                        minWidth: 40,
                        minHeight: 40,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <SecurityIcon sx={{ color: 'white', fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Private & Secure
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your data never leaves your device without encryption
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{
                        minWidth: 40,
                        minHeight: 40,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'info.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <CloudSyncIcon sx={{ color: 'white', fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Multi-device Sync
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Access from anywhere with your recovery phrase
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{
                        minWidth: 40,
                        minHeight: 40,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <ShareIcon sx={{ color: 'white', fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Controlled Sharing
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                  sx={{ py: 1.5 }}
                >
                  Get Started
                </Button>
              </Box>
            </Paper>
          )}

          {currentStep === 'choose-path' && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                backgroundColor: 'background.paper',
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 1 }}>
                How would you like to begin?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                You can always change this later
              </Typography>

              <Stack spacing={2}>
                <Paper
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: mode === 'fresh' ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => handleModeSelect('fresh')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AddIcon color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Start Fresh
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create a new profile for your child
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: mode === 'demo' ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => handleModeSelect('demo')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PlayIcon color="secondary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Try Demo
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Explore with Ellie's example profile
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: showAccessCode ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => setShowAccessCode(!showAccessCode)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShareIcon color="action" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Join with Code
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-digit code"
                        fullWidth
                        size="small"
                        inputProps={{ maxLength: 6, style: { textTransform: 'uppercase', letterSpacing: 2 } }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleJoinWithCode}
                        disabled={accessCode.length !== 6}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Join
                      </Button>
                    </Stack>
                  </Box>
                </Collapse>
              </Stack>
            </Paper>
          )}

          {currentStep === 'child-info' && mode === 'fresh' && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                backgroundColor: 'background.paper',
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 1 }}>
                Tell us about your child
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                This helps personalize your experience
              </Typography>

              <Stack spacing={3}>
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
                  helperText={nameError ? "Child's name is required" : "This is how your child will be identified in the app"}
                  autoFocus
                />
                <TextField
                  label="Preferred Name (optional)"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  fullWidth
                  helperText="Nickname or name they prefer to be called"
                />
                
                <Alert severity="info" icon={<SecurityIcon />}>
                  This information stays on your device and is never shared without your permission
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
                  sx={{ py: 1.5 }}
                >
                  Continue
                </Button>
              </Stack>
            </Paper>
          )}

          {currentStep === 'privacy' && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                backgroundColor: 'background.paper',
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
                Your Privacy Matters
              </Typography>
              
              <Stack spacing={3}>
                <Paper sx={{ 
                  p: 3, 
                  border: '2px solid',
                  borderColor: 'success.main',
                  backgroundColor: 'background.paper' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon color="success" sx={{ mt: 0.5, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Zero-Knowledge Encryption
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your data is encrypted on your device. We never see it.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{ 
                  p: 3, 
                  border: '2px solid',
                  borderColor: 'info.main',
                  backgroundColor: 'background.paper' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon color="info" sx={{ mt: 0.5, fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        No Account Required
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No emails, no passwords, no tracking. Just a recovery phrase.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{ 
                  p: 3, 
                  border: '2px solid',
                  borderColor: 'warning.main',
                  backgroundColor: 'background.paper' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ mt: 0.5, fontSize: 28, color: 'warning.main' }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        You Control Sharing
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Share specific information with time limits and access codes.
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
                sx={{ mt: 4 }}
              >
                I Understand
              </Button>
            </Paper>
          )}

          {currentStep === 'ready' && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                backgroundColor: 'background.paper',
                borderRadius: 3,
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3,
                }}
              >
                <CheckIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {mode === 'demo' ? "Ready to Explore!" : "All Set!"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {mode === 'demo' 
                  ? "You'll be using Ellie's example profile to explore manylla"
                  : `Let's start building ${childName || 'your child'}'s profile`}
              </Typography>

              <Box sx={{ 
                p: 3, 
                backgroundColor: 'action.hover', 
                borderRadius: 2, 
                mb: 4, 
                textAlign: 'left' 
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick tips to get started:
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      flexShrink: 0
                    }} />
                    <Typography variant="body2">
                      Add important information in Quick Info
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      flexShrink: 0
                    }} />
                    <Typography variant="body2">
                      Track progress with Goals and Successes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      flexShrink: 0
                    }} />
                    <Typography variant="body2">
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
                sx={{ py: 1.5 }}
              >
                {mode === 'demo' ? "Start Demo" : "Start Using manylla"}
              </Button>
            </Paper>
          )}
        </Box>
      </Fade>
    </Container>
  );
};