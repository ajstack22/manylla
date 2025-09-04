import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Alert,
  Stack,
  Paper,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Link as LinkIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { ChildProfile } from '../../types/ChildProfile';
import { PrintPreview } from './PrintPreview';
import { useMobileDialog } from '../../hooks/useMobileDialog';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  profile: ChildProfile;
}

const sharePresets = [
  { value: 'teacher', label: 'School Teacher', suggested: ['goals', 'strengths', 'challenges'] },
  { value: 'babysitter', label: 'Babysitter', suggested: ['strengths', 'challenges', 'emergency'] },
  { value: 'doctor', label: 'Medical Team', suggested: ['all'] },
  { value: 'family', label: 'Family Member', suggested: ['successes', 'strengths'] },
  { value: 'custom', label: 'Custom Selection', suggested: [] },
];

type WizardStep = 'recipient' | 'content' | 'settings' | 'complete';

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  profile,
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const [currentStep, setCurrentStep] = useState<WizardStep>('recipient');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientType, setRecipientType] = useState('');
  const [expirationDays, setExpirationDays] = useState(7);
  const [includeQuickInfo, setIncludeQuickInfo] = useState(true);
  const [shareNote, setShareNote] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setCurrentStep('recipient');
      setSelectedCategories([]);
      setRecipientName('');
      setRecipientType('');
      setExpirationDays(7);
      setIncludeQuickInfo(true);
      setShareNote('');
      setGeneratedLink('');
      setAccessCode('');
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep === 'recipient') {
      setCurrentStep('content');
    } else if (currentStep === 'content') {
      setCurrentStep('settings');
    } else if (currentStep === 'settings') {
      handleGenerateLink();
      setCurrentStep('complete');
    }
  };

  const handleBack = () => {
    if (currentStep === 'content') {
      setCurrentStep('recipient');
    } else if (currentStep === 'settings') {
      setCurrentStep('content');
    } else if (currentStep === 'complete') {
      setCurrentStep('settings');
    }
  };

  const canProceed = () => {
    if (currentStep === 'recipient') {
      return recipientType !== '';
    } else if (currentStep === 'content') {
      return selectedCategories.length > 0 || includeQuickInfo;
    }
    return true;
  };

  const handleGenerateLink = () => {
    // Generate access code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setAccessCode(code);
    
    // Store the shared data in localStorage
    const existingShares = localStorage.getItem('manylla_shares');
    const shares = existingShares ? JSON.parse(existingShares) : {};
    
    // Filter the profile data based on selected options
    const sharedProfile = {
      ...profile,
      entries: profile.entries.filter(entry => 
        selectedCategories.includes(entry.category)
      ),
      // Only include visible quick info if includeQuickInfo is true
      quickInfoPanels: includeQuickInfo 
        ? profile.quickInfoPanels?.filter(panel => panel.isVisible) || []
        : []
    };
    
    shares[code] = {
      profile: sharedProfile,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
      recipientName,
      note: shareNote
    };
    
    localStorage.setItem('manylla_shares', JSON.stringify(shares));
    
    const shareDomain = process.env.REACT_APP_SHARE_DOMAIN || window.location.origin;
    setGeneratedLink(`${shareDomain}?share=${code}`);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleRecipientSelect = (preset: string) => {
    setRecipientType(preset);
    const presetConfig = sharePresets.find(p => p.value === preset);
    if (presetConfig && presetConfig.suggested.length > 0 && preset !== 'custom') {
      setSelectedCategories(presetConfig.suggested);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'recipient':
        return 'Who are you sharing with?';
      case 'content':
        return 'What would you like to share?';
      case 'settings':
        return 'How long should they have access?';
      case 'complete':
        return 'Your share link is ready!';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'recipient':
        return (
          <Stack spacing={2}>
            {sharePresets.map((preset) => (
              <Paper
                key={preset.value}
                elevation={0}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: recipientType === preset.value ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  backgroundColor: recipientType === preset.value ? 'action.selected' : 'background.paper',
                  '&:hover': { 
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => handleRecipientSelect(preset.value)}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {preset.label}
                </Typography>
                {preset.suggested.length > 0 && preset.value !== 'custom' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Recommended sharing: {preset.suggested.join(', ')}
                  </Typography>
                )}
                {preset.value === 'custom' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Choose exactly what you want to share
                  </Typography>
                )}
              </Paper>
            ))}
            
            {recipientType && (
              <TextField
                label="Recipient Name (optional)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., Ms. Johnson"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
              />
            )}
          </Stack>
        );

      case 'content':
        return (
          <Stack spacing={2}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeQuickInfo}
                      onChange={(e) => setIncludeQuickInfo(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">Quick Info</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Emergency contacts, medical info, dietary needs
                      </Typography>
                    </Box>
                  }
                />
              </FormGroup>
            </Paper>

            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Select Categories to Share
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {profile.categories.filter(cat => cat.isVisible && !cat.isQuickInfo).map(category => (
                  <Chip
                    key={category.id}
                    label={category.displayName}
                    onClick={() => handleCategoryToggle(category.name)}
                    color={selectedCategories.includes(category.name) ? 'primary' : 'default'}
                    variant={selectedCategories.includes(category.name) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Paper>

            {(selectedCategories.length > 0 || includeQuickInfo) && (
              <Alert severity="info">
                Sharing {
                  profile.entries.filter(entry => selectedCategories.includes(entry.category)).length
                } entries {includeQuickInfo && '+ Quick Info'}
              </Alert>
            )}
          </Stack>
        );

      case 'settings':
        return (
          <Stack spacing={2}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Access Duration</InputLabel>
                <Select
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value as number)}
                  label="Access Duration"
                >
                  <MenuItem value={1}>24 hours</MenuItem>
                  <MenuItem value={3}>3 days</MenuItem>
                  <MenuItem value={7}>1 week</MenuItem>
                  <MenuItem value={30}>1 month</MenuItem>
                  <MenuItem value={90}>3 months</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <TextField
                label="Add a Note (optional)"
                value={shareNote}
                onChange={(e) => setShareNote(e.target.value)}
                multiline
                rows={3}
                placeholder="Any special instructions or context for the recipient..."
                fullWidth
                size="small"
              />
            </Paper>

            <Alert severity="info">
              <Typography variant="body2">
                The recipient will receive a secure link that expires in {expirationDays} {expirationDays === 1 ? 'day' : 'days'}.
                They will need the access code to view the information.
              </Typography>
            </Alert>
          </Stack>
        );

      case 'complete':
        return (
          <Stack spacing={2}>
            <Alert severity="success" icon={<CheckIcon />}>
              Your secure share link has been generated!
            </Alert>

            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)',
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Access Code: {accessCode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share this code with {recipientName || 'the recipient'}
              </Typography>
            </Paper>

            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Share Link
              </Typography>
              <TextField
                value={generatedLink}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => copyToClipboard(generatedLink)} size="small">
                        <CopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>

            <Stack direction="row" spacing={1}>
              <Chip
                icon={<CalendarIcon />}
                label={`Expires in ${expirationDays} ${expirationDays === 1 ? 'day' : 'days'}`}
                variant="outlined"
              />
              {recipientName && (
                <Chip
                  label={`For: ${recipientName}`}
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>
        );
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} {...(isMobile ? { ...mobileDialogProps, maxWidth: 'md' } : { maxWidth: 'md', fullWidth: true })}>
        {isMobile ? (
          <AppBar position="sticky" color="default" elevation={0}>
            <Toolbar>
              <ShareIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Share Information
              </Typography>
              <IconButton edge="end" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        ) : (
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShareIcon sx={{ mr: 1 }} />
              Share Information
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
              <ShareIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {getStepTitle()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Step {currentStep === 'recipient' ? 1 : currentStep === 'content' ? 2 : currentStep === 'settings' ? 3 : 4} of 4
              </Typography>
            </Box>
          )}
          {renderStepContent()}
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 2 }}>
          {currentStep !== 'complete' ? (
            <>
              <Button onClick={onClose}>Cancel</Button>
              {currentStep !== 'recipient' && (
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                >
                  Back
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed()}
                endIcon={currentStep === 'settings' ? <CheckIcon /> : <ArrowForwardIcon />}
              >
                {currentStep === 'settings' ? 'Generate Link' : 'Next'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentStep('recipient');
                  setGeneratedLink('');
                  setAccessCode('');
                }}
              >
                Share Another
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button variant="contained" onClick={onClose}>
                Done
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      <PrintPreview
        open={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        childName={profile.preferredName || profile.name}
        selectedCategories={selectedCategories}
        entries={{
          goals: profile.entries.filter(e => e.category === 'goals'),
          successes: profile.entries.filter(e => e.category === 'successes'),
          strengths: profile.entries.filter(e => e.category === 'strengths'),
          challenges: profile.entries.filter(e => e.category === 'challenges'),
        }}
        includeQuickInfo={includeQuickInfo}
        recipientName={recipientName}
        note={shareNote}
      />
    </>
  );
};