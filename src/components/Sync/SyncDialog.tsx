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
        <>
          <Alert severity="success" icon={<CloudSyncIcon />} sx={{ mb: 3 }}>
            Multi-device sync is enabled
          </Alert>
          
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Sync Status
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
            </Paper>
            
            <Alert severity="info">
              Your child's information is encrypted and synced across your devices. 
              Only you can access this data with your recovery phrase.
            </Alert>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => disableSync()}
              fullWidth
            >
              Disable Sync
            </Button>
          </Stack>
        </>
      );
    }

    switch (mode) {
      case 'menu':
        return (
          <>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Sync your child's information securely across all your devices. 
              No account needed - just a recovery phrase.
            </Typography>
            
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<CloudSyncIcon />}
                onClick={() => setMode('enable')}
                fullWidth
                size="large"
              >
                Enable Sync on This Device
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={() => setMode('join')}
                fullWidth
                size="large"
              >
                Join Existing Sync
              </Button>
            </Stack>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="caption">
                All data is encrypted on your device. We never see your information.
              </Typography>
            </Alert>
          </>
        );

      case 'enable':
        return (
          <>
            <Typography variant="body1" sx={{ mb: 3 }}>
              This will create a secure sync group for your devices. 
              You'll receive a recovery phrase to access your data from other devices.
            </Typography>
            
            <Stack spacing={3}>
              <Paper sx={{ p: 2, backgroundColor: 'action.hover' }}>
                <Typography variant="subtitle2" gutterBottom>
                  What happens next:
                </Typography>
                <Typography variant="body2">
                  1. Generate a unique recovery phrase<br />
                  2. Encrypt your data locally<br />
                  3. Create secure sync group<br />
                  4. Show recovery phrase (save it!)
                </Typography>
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
          </>
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
            <CloudSyncIcon sx={{ mr: 1 }} />
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
            <CloudSyncIcon sx={{ mr: 1 }} />
            Multi-Device Sync
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}
      
      <DialogContent sx={{ pt: isMobile ? 2 : 3 }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};