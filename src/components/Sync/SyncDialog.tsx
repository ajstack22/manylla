import React, { useState } from 'react';
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
  Security as SecurityIcon,
  Check as CheckIcon,
  Cloud as CloudIcon,
  CloudSync as CloudSyncIcon,
} from '@mui/icons-material';
import { useSync } from '../../context/SyncContext';
import { useMobileDialog } from '../../hooks/useMobileDialog';

interface SyncDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SyncDialog: React.FC<SyncDialogProps> = ({ open, onClose }) => {
  const { syncEnabled, syncStatus, enableSync, joinSync, disableSync, syncNow } = useSync();
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const [mode, setMode] = useState<'menu' | 'enable' | 'join' | 'phrase'>('menu');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [joinPhrase, setJoinPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEnableSync = async () => {
    try {
      setLoading(true);
      setError('');
      const { recoveryPhrase } = await enableSync();
      setRecoveryPhrase(recoveryPhrase);
      setMode('phrase');
    } catch (err: any) {
      setError(err.message || 'Failed to enable sync');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSync = async () => {
    try {
      setLoading(true);
      setError('');
      await joinSync(joinPhrase);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join sync');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(recoveryPhrase);
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
                  Security
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your child's information is encrypted and synced across your devices. 
                  Only you can access this data with your recovery phrase.
                </Typography>
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
                    Enable Sync on This Device
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a new sync group for your devices
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
                    Join Existing Sync
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect to your existing sync group with a recovery phrase
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
                backgroundColor: 'info.light',
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
              Enter your recovery phrase from another device to sync your data.
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                label="Recovery Phrase"
                value={joinPhrase}
                onChange={(e) => setJoinPhrase(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Enter your 12-word recovery phrase"
                helperText="Words should be separated by spaces"
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
            
            <Paper sx={{ p: 3, backgroundColor: 'warning.light', mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'monospace' }}>
                {recoveryPhrase}
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
              I've Saved My Recovery Phrase
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
              Multi-Device Sync
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
            Multi-Device Sync
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
              Multi-Device Sync
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