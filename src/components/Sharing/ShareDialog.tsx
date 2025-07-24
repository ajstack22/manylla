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
} from '@mui/icons-material';
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

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  profile,
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['goals', 'successes']);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientType, setRecipientType] = useState('custom');
  const [expirationDays, setExpirationDays] = useState(7);
  const [includeQuickInfo, setIncludeQuickInfo] = useState(true);
  const [shareNote, setShareNote] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const handleGenerateLink = () => {
    // Generate access code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setAccessCode(code);
    
    // Store the shared data in localStorage
    const existingShares = localStorage.getItem('manyla_shares');
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
    
    shares[code] = {
      profile: sharedProfile,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
      recipientName,
      note: shareNote
    };
    
    localStorage.setItem('manyla_shares', JSON.stringify(shares));
    
    const shareDomain = process.env.REACT_APP_SHARE_DOMAIN || 'https://stackmap.app/manyla';
    setGeneratedLink(`${shareDomain}?share=${code}`);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePresetChange = (preset: string) => {
    setRecipientType(preset);
    const presetConfig = sharePresets.find(p => p.value === preset);
    if (presetConfig && presetConfig.suggested.length > 0) {
      setSelectedCategories(presetConfig.suggested);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
        <Stack spacing={3}>
          {/* Recipient Information */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              1. Who are you sharing with?
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth>
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
              />
            </Stack>
          </Paper>

          {/* Content Selection */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              2. What information to share?
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeQuickInfo}
                    onChange={(e) => setIncludeQuickInfo(e.target.checked)}
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
            <Typography variant="h6" gutterBottom>
              3. Access Settings
            </Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth>
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

      <DialogActions>
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