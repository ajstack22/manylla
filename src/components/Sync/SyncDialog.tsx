import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  TextField,
  IconButton,
  Stack,
  Paper,
  Chip,
  CircularProgress,
  InputAdornment,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Sync as SyncIcon,
  ContentCopy as CopyIcon,
  ContentCopy,
  Security as SecurityIcon,
  Check as CheckIcon,
  Cloud as CloudIcon,
  CloudSync as CloudSyncIcon,
  QrCode as QrCodeIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useSync } from '../../context/SyncContext';
import { useMobileDialog } from '../../hooks/useMobileDialog';
import { 
  generateInviteCode, 
  validateInviteCode, 
  normalizeInviteCode,
  generateInviteUrl,
  storeInviteCode,
  getInviteCode,
  formatInviteCodeForDisplay 
} from '../../utils/inviteCode';

interface SyncDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SyncDialog: React.FC<SyncDialogProps> = ({ open, onClose }) => {
  const { syncEnabled, syncStatus, enableSync, disableSync, syncNow, recoveryPhrase: existingPhrase, syncId } = useSync();
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const [mode, setMode] = useState<'menu' | 'enable' | 'join' | 'phrase' | 'existing' | 'invite'>('menu');
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [joinPhrase, setJoinPhrase] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [currentInviteCode, setCurrentInviteCode] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);

  const handleEnableSync = async () => {
    try {
      setLoading(true);
      setError('');
      const { recoveryPhrase } = await enableSync(true);
      setGeneratedPhrase(recoveryPhrase);
      setMode('phrase');
    } catch (err: any) {
      setError(err.message || 'Failed to enable backup');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSync = async () => {
    try {
      setLoading(true);
      setError('');
      
      let recoveryPhraseToUse = joinPhrase.trim();
      
      // Check if it's an invite code (XXXX-XXXX format)
      if (validateInviteCode(recoveryPhraseToUse)) {
        // Try to get recovery phrase from invite code
        const inviteData = getInviteCode(recoveryPhraseToUse);
        if (!inviteData) {
          throw new Error('Invalid or expired invite code');
        }
        recoveryPhraseToUse = inviteData.recoveryPhrase;
      } else {
        // Validate 32-char hex format
        const cleanPhrase = recoveryPhraseToUse.toLowerCase();
        if (!cleanPhrase.match(/^[a-f0-9]{32}$/)) {
          throw new Error('Invalid format. Enter an 8-character invite code (XXXX-XXXX) or 32-character backup code.');
        }
        recoveryPhraseToUse = cleanPhrase;
      }
      
      await enableSync(false, recoveryPhraseToUse);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join backup');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateInvite = () => {
    if (!existingPhrase || !syncId) {
      setError('Sync must be enabled to generate invite codes');
      return;
    }
    
    const inviteCode = generateInviteCode();
    const url = generateInviteUrl(inviteCode, existingPhrase);
    
    // Store invite code mapping locally
    storeInviteCode(inviteCode, syncId, existingPhrase);
    
    setCurrentInviteCode(inviteCode);
    setInviteUrl(url);
    setMode('invite');
  };

  const handleCopyPhrase = () => {
    const phrase = generatedPhrase || existingPhrase || '';
    navigator.clipboard.writeText(phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCopyInvite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncNow = async () => {
    try {
      setLoading(true);
      await syncNow();
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (syncEnabled && mode === 'menu') {
      return (
        <Stack spacing={2}>
          <Alert severity="success" icon={<CloudSyncIcon />}>
            Multi-device sync is enabled
          </Alert>
          
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <SyncIcon sx={{ color: 'primary.main', mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Sync Status
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Your data is synchronized across devices
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={syncStatus}
                    color={syncStatus === 'success' ? 'success' : 'default'}
                    size="small"
                  />
                  <Button
                    size="small"
                    startIcon={<SyncIcon />}
                    onClick={handleSyncNow}
                    disabled={loading}
                  >
                    Sync Now
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <SecurityIcon sx={{ color: 'info.main', mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Security & Sharing
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Your child's information is encrypted and backed up across your devices.
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => setMode('existing')}
                    startIcon={<SecurityIcon />}
                    variant="outlined"
                  >
                    View Backup Code
                  </Button>
                  <Button
                    size="small"
                    onClick={handleGenerateInvite}
                    startIcon={<ContentCopy />}
                    variant="contained"
                  >
                    Create Invite Code
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Paper>
          
          <Button
            variant="outlined"
            color="error"
            onClick={() => disableSync()}
            fullWidth
          >
            Disable Sync
          </Button>
        </Stack>
      );
    }

    switch (mode) {
      case 'menu':
        return (
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => setMode('enable')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CloudSyncIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Enable Backup on This Device
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a new backup for your devices
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Paper
              elevation={0}
              sx={{
                p: 3,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => setMode('join')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SyncIcon sx={{ fontSize: 32, color: 'info.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Restore from Backup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect to your existing backup with a backup code
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Alert severity="info">
              <Typography variant="caption">
                All data is encrypted on your device. We never see your information.
              </Typography>
            </Alert>
          </Stack>
        );

      case 'enable':
        return (
          <Stack spacing={2}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Create Secure Sync
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This will create a secure sync group for your devices. 
                    You'll receive a recovery phrase to access your data from other devices.
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.08)' : 'rgba(33, 150, 243, 0.08)',
                border: '1px solid',
                borderColor: 'info.main',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <CheckIcon sx={{ fontSize: 32, color: 'info.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    What happens next
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Generate a unique recovery phrase</li>
                      <li>Encrypt your data locally</li>
                      <li>Create secure sync group</li>
                      <li>Show recovery phrase (save it!)</li>
                    </ol>
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            {error && <Alert severity="error">{error}</Alert>}
            
            <Stack direction="row" spacing={2}>
              <Button onClick={() => setMode('menu')} disabled={loading}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleEnableSync}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
                fullWidth
              >
                Create Secure Sync
              </Button>
            </Stack>
          </Stack>
        );

      case 'join':
        return (
          <>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter an invite code or backup code from another device to restore your data.
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                label="Invite Code or Backup Code"
                value={joinPhrase}
                onChange={(e) => setJoinPhrase(e.target.value)}
                fullWidth
                placeholder="XXXX-XXXX or 32-character code"
                helperText="Enter an 8-character invite code (XXXX-XXXX) or 32-character backup code"
                inputProps={{
                  style: { fontFamily: 'monospace' }
                }}
              />
              
              {error && <Alert severity="error">{error}</Alert>}
              
              <Stack direction="row" spacing={2}>
                <Button onClick={() => setMode('menu')} disabled={loading}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleJoinSync}
                  disabled={loading || !joinPhrase.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <SyncIcon />}
                  fullWidth
                >
                  Join Sync
                </Button>
              </Stack>
            </Stack>
          </>
        );

      case 'phrase':
        return (
          <>
            <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
              Sync enabled successfully!
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Save this recovery phrase in a secure location. 
              You'll need it to access your data from other devices.
            </Typography>
            
            <Paper sx={{ 
              p: 3, 
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255, 167, 38, 0.08)' 
                : theme.palette.warning.light,
              mb: 3 
            }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  color: (theme) => theme.palette.text.primary
                }}
              >
                {generatedPhrase}
              </Typography>
              <Button
                startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                onClick={handleCopyPhrase}
                size="small"
                sx={{ mt: 1 }}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </Paper>
            
            <Alert severity="warning">
              <Typography variant="caption">
                <strong>Important:</strong> This phrase is the only way to access your synced data. 
                Store it securely and never share it with anyone.
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              onClick={onClose}
              fullWidth
              sx={{ mt: 3 }}
            >
              I've Saved My Backup Code
            </Button>
          </>
        );
        
      case 'invite':
        return (
          <>
            <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
              Invite code created successfully!
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Share this invite code with another device. It expires in 24 hours.
            </Typography>
            
            <Paper sx={{ 
              p: 3, 
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)',
              mb: 2,
              textAlign: 'center'
            }}>
              <Typography variant="h3" sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                letterSpacing: 2,
                mb: 2
              }}>
                {formatInviteCodeForDisplay(currentInviteCode)}
              </Typography>
              <Button
                startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                onClick={() => handleCopyInvite(currentInviteCode)}
                variant="contained"
                size="small"
              >
                {copied ? 'Copied!' : 'Copy Invite Code'}
              </Button>
            </Paper>
            
            <Paper sx={{ 
              p: 2, 
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              mb: 3
            }}>
              <Typography variant="subtitle2" gutterBottom>
                Or share this link:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  mb: 1
                }}
              >
                {inviteUrl}
              </Typography>
              <Button
                startIcon={copied ? <CheckIcon /> : <ShareIcon />}
                onClick={() => handleCopyInvite(inviteUrl)}
                size="small"
                fullWidth
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </Paper>
            
            <Alert severity="info">
              <Typography variant="caption">
                The recipient can enter the invite code or click the link to restore the backup on their device.
              </Typography>
            </Alert>
            
            <Button
              variant="outlined"
              onClick={() => setMode('menu')}
              fullWidth
              sx={{ mt: 3 }}
            >
              Done
            </Button>
          </>
        );
        
      case 'existing':
        return (
          <>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your backup code for accessing data from other devices:
            </Typography>
            
            <Paper sx={{ 
              p: 3, 
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(33, 150, 243, 0.08)' 
                : theme.palette.info.light,
              mb: 3,
              position: 'relative'
            }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  filter: showPhrase ? 'none' : 'blur(8px)',
                  userSelect: showPhrase ? 'text' : 'none',
                  transition: 'filter 0.3s ease'
                }}
              >
                {existingPhrase || 'No backup code available'}
              </Typography>
              {!showPhrase && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setShowPhrase(true)}
                  >
                    Click to reveal
                  </Button>
                </Box>
              )}
              {showPhrase && (
                <Button
                  startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                  onClick={handleCopyPhrase}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              )}
            </Paper>
            
            <Alert severity="info">
              <Typography variant="caption">
                Use this code to restore your backup on another device.
              </Typography>
            </Alert>
            
            <Button
              variant="outlined"
              onClick={() => {
                setShowPhrase(false);
                setMode('menu');
              }}
              fullWidth
              sx={{ mt: 3 }}
            >
              Back
            </Button>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} {...mobileDialogProps}>
      {isMobile ? (
        <AppBar position="sticky" color="default" elevation={0}>
          <Toolbar>
            <CloudIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Backup & Sync
            </Typography>
            <IconButton edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudIcon sx={{ mr: 1 }} />
            Backup & Sync
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
            <CloudIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Backup & Sync
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Keep your child's information synchronized across all your devices
            </Typography>
          </Box>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};