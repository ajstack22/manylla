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
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { ChildProfile } from '../../types/ChildProfile';

interface SharedViewProps {
  shareCode: string;
}

export const SharedView: React.FC<SharedViewProps> = ({ shareCode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharedProfile, setSharedProfile] = useState<ChildProfile | null>(null);

  // Auto-authenticate with code from URL
  React.useEffect(() => {
    // In production, this would validate against the server
    // For now, we'll check localStorage for shared data
    const loadSharedData = async () => {
      try {
        // Check if there's a stored share that matches this code
        const storedShares = localStorage.getItem('manyla_shares');
        if (storedShares) {
          const shares = JSON.parse(storedShares);
          const shareData = shares[shareCode];
          
          if (shareData) {
            // Parse the shared profile data
            const profile = shareData.profile;
            profile.dateOfBirth = new Date(profile.dateOfBirth);
            profile.createdAt = new Date(profile.createdAt);
            profile.updatedAt = new Date(profile.updatedAt);
            profile.entries = profile.entries.map((e: any) => ({
              ...e,
              date: new Date(e.date)
            }));
            
            setSharedProfile(profile);
            setIsAuthenticated(true);
          } else {
            setError('Invalid or expired share code');
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        You are viewing shared information for {sharedProfile.preferredName || sharedProfile.name}. 
        This is a temporary link that will expire.
      </Alert>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {sharedProfile.preferredName || sharedProfile.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {sharedProfile.pronouns} • Born {sharedProfile.dateOfBirth.toLocaleDateString()}
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
      
      {/* Entries by category */}
      {['goals', 'successes', 'strengths', 'challenges'].map(category => {
        const entries = sharedProfile.entries.filter(e => e.category === category);
        if (entries.length === 0) return null;
        
        return (
          <Paper key={category} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Typography>
            <Stack spacing={2}>
              {entries.map(entry => (
                <Box key={entry.id}>
                  <Typography variant="subtitle1">{entry.title}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {entry.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        );
      })}
    </Container>
  );
};