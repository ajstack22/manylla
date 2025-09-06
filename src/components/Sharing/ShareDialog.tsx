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
  Divider,
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
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { Entry, ChildProfile } from '../../types/ChildProfile';
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

// Encryption functions for secure share storage
const encryptShare = (data: any, shareCode: string): string => {
  // Derive key from share code
  const codeBytes = new TextEncoder().encode(shareCode + 'ManyllaShare2025');
  let key = codeBytes;
  for (let i = 0; i < 1000; i++) {
    key = nacl.hash(key);
  }
  key = key.slice(0, 32);
  
  // Encrypt
  const nonce = nacl.randomBytes(24);
  const dataBytes = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = nacl.secretbox(dataBytes, nonce, key);
  
  // Combine nonce + encrypted
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);
  
  return util.encodeBase64(combined);
};

// Secure code generation using crypto.getRandomValues
const generateSecureCode = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  profile,
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const [currentStep, setCurrentStep] = useState<WizardStep>('recipient');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
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
    // Generate secure access code
    const code = generateSecureCode();
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
        ? profile.quickInfoPanels.filter(panel => panel.isVisible)
        : []
    };
    
    // Encrypt ALL data including metadata to prevent plaintext exposure
    const shareData = {
      profile: sharedProfile,
      recipientName,
      note: shareNote
    };
    
    shares[code] = {
      encrypted: encryptShare(shareData, code),
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
      // recipientName and note are now inside the encrypted payload
    };
    
    localStorage.setItem('manylla_shares', JSON.stringify(shares));
    
    const shareDomain = process.env.REACT_APP_SHARE_DOMAIN || 'https://stackmap.app/manylla';
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
                backgroundColor: 'primary.light',
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
              Share {profile.preferredName || profile.name}'s Info
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
            Share {profile.preferredName || profile.name}'s Information
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
              Share {profile.preferredName || profile.name}'s Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Securely share selected information with caregivers and professionals
            </Typography>
          </Box>
        )}
        <Stack spacing={2}>
          {/* Recipient Information */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Who are you sharing with?
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Recipient Type</InputLabel>
                <Select
                  value={recipientType}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  label="Recipient Type"
                >
                  {sharePresets.map(preset => (
                    <MenuItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Recipient Name (optional)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., Ms. Johnson"
                fullWidth
                size="small"
              />
            </Stack>
          </Paper>

          {/* Content Selection */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              What information to share?
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeQuickInfo}
                    onChange={(e) => setIncludeQuickInfo(e.target.checked)}
                    size="small"
                  />
                }
                label="Include Quick Info (Emergency contacts, medical, dietary)"
              />
            </FormGroup>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Categories to Share:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {profile.categories.filter(cat => cat.isVisible).map(category => (
                <Chip
                  key={category.id}
                  label={category.displayName}
                  onClick={() => handleCategoryToggle(category.name)}
                  color={selectedCategories.includes(category.name) ? 'primary' : 'default'}
                  variant={selectedCategories.includes(category.name) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>

            {selectedCategories.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Sharing {profile.entries
                  .filter(entry => selectedCategories.includes(entry.category))
                  .length
                } entries across {selectedCategories.length} categories
              </Alert>
            )}
          </Paper>

          {/* Access Settings */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Access Settings
            </Typography>
            
            <Stack spacing={2}>
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
                  <MenuItem value={365}>1 year</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Optional Note"
                value={shareNote}
                onChange={(e) => setShareNote(e.target.value)}
                multiline
                rows={2}
                placeholder="Any special instructions or context for the recipient..."
                fullWidth
                size="small"
              />
            </Stack>
          </Paper>

          {/* Generated Link */}
          {generatedLink && (
            <Paper sx={{ p: 2, backgroundColor: 'action.hover' }}>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Secure Share Link Generated
              </Typography>
              
              <Stack spacing={2}>
                <TextField
                  value={generatedLink}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => copyToClipboard(generatedLink)}>
                          <CopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip
                    label={`Access Code: ${accessCode}`}
                    color="primary"
                    icon={<SecurityIcon />}
                  />
                  <Chip
                    label={`Expires in ${expirationDays} days`}
                    icon={<CalendarIcon />}
                  />
                </Box>

                <Alert severity="success">
                  Share this link with {recipientName || 'the recipient'}. They'll need the access code: <strong>{accessCode}</strong>
                </Alert>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    onClick={() => {/* Generate QR */}}
                  >
                    Show QR Code
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {/* Preview */}}
                  >
                    Preview Shared View
                  </Button>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        {!generatedLink ? (
          <>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => setShowPrintPreview(true)}
              disabled={selectedCategories.length === 0}
              sx={{ mr: 1 }}
            >
              Export/Print
            </Button>
            <Button
              variant="contained"
              startIcon={<LinkIcon />}
              onClick={handleGenerateLink}
              disabled={selectedCategories.length === 0}
            >
              Generate Secure Link
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={onClose}>
            Done
          </Button>
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