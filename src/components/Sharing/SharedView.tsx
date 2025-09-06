import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Stack,
  Chip,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
} from '@mui/material';
import { 
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { ChildProfile } from '../../types/ChildProfile';
import { unifiedCategories } from '../../utils/unifiedCategories';

interface SharedViewProps {
  shareCode: string;
}

// Decryption function for shares
const decryptShare = (encryptedData: string, shareCode: string): any => {
  // Derive same key
  const codeBytes = new TextEncoder().encode(shareCode + 'ManyllaShare2025');
  let key = codeBytes;
  for (let i = 0; i < 1000; i++) {
    key = nacl.hash(key);
  }
  key = key.slice(0, 32);
  
  // Decrypt
  const combined = util.decodeBase64(encryptedData);
  const nonce = combined.slice(0, 24);
  const ciphertext = combined.slice(24);
  
  const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
  if (!decrypted) throw new Error('Invalid share code');
  
  return JSON.parse(new TextDecoder().decode(decrypted));
};

// Manylla theme colors - hardcoded for consistent provider view
const manyllaColors = {
  background: '#C4A66B',      // Actual manila envelope color
  paper: '#D4B896',           // Lighter manila for cards
  text: '#3D2F1F',            // Dark brown text
  textSecondary: '#5D4A37',   // Medium brown for secondary text
  border: '#A68B5B',          // Darker manila for borders
};

export const SharedView: React.FC<SharedViewProps> = ({ shareCode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharedProfile, setSharedProfile] = useState<ChildProfile | null>(null);

  // Auto-authenticate with code from URL
  React.useEffect(() => {
    const loadSharedData = async () => {
      try {
        // Parse share code - it might be "token#key" format or just "token"
        let token = shareCode;
        let encryptionKey = '';
        
        if (shareCode.includes('#')) {
          const parts = shareCode.split('#');
          token = parts[0];
          encryptionKey = parts[1];
          console.log('[SharedView] Using token+key format:', { token, hasKey: !!encryptionKey });
        }
        
        // Check for shares in localStorage - try both v2 (new) and v1 (old) formats
        const storedSharesV2 = localStorage.getItem('manylla_shares_v2');
        const storedSharesV1 = localStorage.getItem('manylla_shares');
        
        let shareData = null;
        let isV2Format = false;
        
        // First try v2 format (from ShareDialogOptimized)
        if (storedSharesV2) {
          const sharesV2 = JSON.parse(storedSharesV2);
          const v2Data = sharesV2[token]; // V2 uses just the token
          if (v2Data) {
            shareData = v2Data;
            isV2Format = true;
            console.log('[SharedView] Found v2 share for token:', token);
          }
        }
        
        // Fall back to v1 format if not found
        if (!shareData && storedSharesV1) {
          const sharesV1 = JSON.parse(storedSharesV1);
          shareData = sharesV1[shareCode] || sharesV1[token];
          if (shareData) {
            console.log('[SharedView] Found v1 share');
          }
        }
        
        if (shareData) {
          try {
            let decryptedData;
            
            if (isV2Format && shareData.encryptedData) {
              // V2 format: uses encryptedData field and key from URL
              if (!encryptionKey) {
                setError('Missing decryption key in URL');
                setIsLoading(false);
                return;
              }
              
              // Decrypt with the key from URL fragment
              const keyBytes = util.decodeBase64(encryptionKey);
              const combined = util.decodeBase64(shareData.encryptedData);
              const nonce = combined.slice(0, 24);
              const ciphertext = combined.slice(24);
              
              const decrypted = nacl.secretbox.open(ciphertext, nonce, keyBytes);
              if (!decrypted) {
                throw new Error('Invalid share key');
              }
              
              decryptedData = JSON.parse(util.encodeUTF8(decrypted));
            } else if (shareData.encrypted) {
              // V1 format: uses token to derive key
              decryptedData = decryptShare(shareData.encrypted, token);
            } else {
              throw new Error('Unknown share format');
            }
            
            // Handle both old format (direct profile) and new format (profile inside shareData)
            const profile = decryptedData.profile || decryptedData;
            
            // Check expiration
            const expiresAt = new Date(shareData.expiresAt);
            if (expiresAt < new Date()) {
              setError('This share has expired');
            } else {
              // Parse dates
              profile.dateOfBirth = new Date(profile.dateOfBirth);
              profile.createdAt = new Date(profile.createdAt);
              profile.updatedAt = new Date(profile.updatedAt);
              profile.entries = profile.entries.map((e: any) => ({
                ...e,
                date: new Date(e.date)
              }));
              
              setSharedProfile(profile);
              setIsAuthenticated(true);
            }
          } catch (decryptError) {
            console.error('Decryption error:', decryptError);
            setError('Invalid share code or decryption failed');
          }
        } else {
          setError('Share code not found');
        }
      } catch (err) {
        setError('Failed to load shared data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSharedData();
  }, [shareCode]);

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Verifying Access
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Verifying access code...
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!isAuthenticated && error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error">{error}</Alert>
        </Paper>
      </Container>
    );
  }

  if (!sharedProfile) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error">No profile data found for this share code</Alert>
        </Paper>
      </Container>
    );
  }

  // Simplified shared view - in production this would show filtered data
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: manyllaColors.background,
    }}>
      {/* Provider Mode Header */}
      <AppBar position="sticky" elevation={0} sx={{ 
        backgroundColor: manyllaColors.paper,
        borderBottom: `1px solid ${manyllaColors.border}`,
        color: manyllaColors.text,
      }}>
        <Toolbar>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${manyllaColors.text} 0%, ${manyllaColors.textSecondary} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-2px',
              lineHeight: 1,
              fontSize: '48px',
              flexGrow: 1,
              paddingBottom: '8px',
              paddingTop: '4px',
              overflow: 'visible',
              display: 'inline-block',
            }}
          >
            manylla
          </Typography>
          <VisibilityIcon sx={{ mr: 1, color: manyllaColors.textSecondary }} />
          <Chip 
            icon={<PersonIcon />}
            label={sharedProfile.preferredName || sharedProfile.name}
            sx={{
              borderColor: manyllaColors.text,
              color: manyllaColors.text,
              '& .MuiChip-icon': {
                color: manyllaColors.text,
              }
            }}
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, pb: 4 }}>
        <Paper
          elevation={0}
          sx={{ 
            mb: 3,
            p: 2,
            backgroundColor: manyllaColors.paper,
            border: `1px solid ${manyllaColors.border}`,
            color: manyllaColors.text,
          }}
        >
          <Typography variant="body2" sx={{ color: manyllaColors.text }}>
            <strong>Shared Access:</strong> You are viewing information shared by the family. 
            This is a temporary link that will expire.
          </Typography>
        </Paper>
      
        <Paper sx={{ 
          p: 4, 
          mb: 3, 
          textAlign: 'center',
          backgroundColor: manyllaColors.paper,
          color: manyllaColors.text,
        }}>
          <Avatar 
            src={sharedProfile.photo || undefined}
            sx={{ 
              width: 80, 
              height: 80, 
              margin: '0 auto',
              mb: 2,
              backgroundColor: manyllaColors.textSecondary,
              color: manyllaColors.paper,
              fontSize: '2rem',
            }}
          >
            {!sharedProfile.photo && (sharedProfile.preferredName || sharedProfile.name).charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4" gutterBottom sx={{ color: manyllaColors.text }}>
            {sharedProfile.preferredName || sharedProfile.name}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: manyllaColors.textSecondary }}>
            {sharedProfile.pronouns && `${sharedProfile.pronouns} • `}
            Born {sharedProfile.dateOfBirth.toLocaleDateString()}
          </Typography>
        </Paper>
      
      {/* Quick Info */}
      {sharedProfile.quickInfoPanels && sharedProfile.quickInfoPanels.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Quick Information</Typography>
          <Stack spacing={2}>
            {sharedProfile.quickInfoPanels
              .filter(panel => panel.isVisible && panel.value)
              .map((panel) => (
                <Box key={panel.id}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {panel.displayName}:
                  </Typography>
                  <Typography variant="body1">{panel.value}</Typography>
                </Box>
              ))}
          </Stack>
        </Paper>
      )}
      
        {/* Entries by category - show all unified categories */}
        {unifiedCategories
          .filter(cat => cat.isVisible)
          .sort((a, b) => a.order - b.order)
          .map(category => {
            const entries = sharedProfile.entries.filter(e => e.category === category.name);
            if (entries.length === 0 && !category.isQuickInfo) return null;
            
            // Handle Quick Info category specially
            if (category.isQuickInfo) {
              const quickInfoEntries = sharedProfile.entries.filter(e => e.category === 'quick-info');
              if (quickInfoEntries.length === 0 && 
                  (!sharedProfile.quickInfoPanels || sharedProfile.quickInfoPanels.length === 0)) {
                return null;
              }
            }
            
            return (
              <Paper key={category.id} sx={{ 
                p: 3, 
                mb: 2,
                backgroundColor: manyllaColors.paper,
                color: manyllaColors.text,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 24,
                      backgroundColor: category.color,
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6" sx={{ color: manyllaColors.text }}>
                    {category.displayName}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  {entries.map(entry => (
                    <Box key={entry.id}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, color: manyllaColors.text }}>
                        {entry.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        paragraph
                        sx={{ color: manyllaColors.textSecondary }}
                        dangerouslySetInnerHTML={{ __html: entry.description }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            );
          })}
      </Container>
    </Box>
  );
};