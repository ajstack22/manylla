import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  Avatar,
  Chip,
  Card,
  CardContent,
  Stack,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Lock as LockIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ChildProfile, Entry } from '../../types/ChildProfile';

interface SharedProfileViewProps {
  isAuthenticated?: boolean;
}

export const SharedProfileView: React.FC<SharedProfileViewProps> = ({ 
  isAuthenticated = false 
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(isAuthenticated);
  const [error, setError] = useState('');

  const handleUnlock = () => {
    // Mock validation
    if (accessCode.toUpperCase() === 'ABC123') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  // Mock shared data
  const sharedData = {
    childName: 'Ellie Thompson',
    sharedBy: 'Sarah Thompson (Parent)',
    sharedDate: new Date('2024-01-20'),
    expiresDate: new Date('2024-01-27'),
    recipientName: 'Ms. Johnson',
    note: 'Ellie will be in your class starting Monday. Here\'s some helpful information about her needs and communication style.',
    quickInfo: {
      communication: 'Uses 2-3 word phrases. Understands more than she can express.',
      emergency: 'Mom: 555-0123, Dad: 555-0124',
    },
    sharedCategories: {
      strengths: [
        {
          title: 'Visual Learning',
          description: 'Ellie learns best with visual aids. Picture cards and demonstrations work much better than verbal instructions alone.',
        },
      ],
      challenges: [
        {
          title: 'Loud Noises',
          description: 'Sudden loud noises cause significant distress. Always warn beforehand when possible. Noise-canceling headphones help.',
        },
      ],
    },
  };

  if (!isUnlocked) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Secure Shared Profile
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            This information has been securely shared with you. 
            Please enter the access code provided by the parent.
          </Typography>
          
          <TextField
            label="Access Code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Enter 6-character code"
            error={!!error}
            helperText={error}
          />
          
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleUnlock}
            disabled={accessCode.length < 6}
          >
            Access Profile
          </Button>
          
          <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
            Access codes are case-insensitive
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src="/manila.png"
              alt="Manyla"
              style={{ height: 32 }}
            />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Manyla - Shared Profile
            </Typography>
            <Chip
              icon={<AccessTimeIcon />}
              label={`Expires ${sharedData.expiresDate.toLocaleDateString()}`}
              color="warning"
              size="small"
            />
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="md">
        {/* Share Info Banner */}
        <Alert 
          severity="info" 
          icon={<PersonIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>{sharedData.sharedBy}</strong> shared this information with{' '}
            <strong>{sharedData.recipientName}</strong> on{' '}
            {sharedData.sharedDate.toLocaleDateString()}
          </Typography>
        </Alert>

        {/* Note from Parent */}
        {sharedData.note && (
          <Card sx={{ mb: 3, backgroundColor: 'action.hover' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Note from Parent:
              </Typography>
              <Typography variant="body2">
                {sharedData.note}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Child Info */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
              {sharedData.childName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4">
                {sharedData.childName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shared Profile
              </Typography>
            </Box>
          </Box>

          {/* Quick Info */}
          {sharedData.quickInfo && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Quick Information
              </Typography>
              <Stack spacing={2}>
                {Object.entries(sharedData.quickInfo).map(([key, value]) => (
                  <Box key={key}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                    <Typography variant="body1">
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Paper>

        {/* Shared Categories */}
        {Object.entries(sharedData.sharedCategories).map(([category, entries]) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: category === 'strengths' ? 'warning.main' : 'error.main' 
            }}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Typography>
            <Stack spacing={2}>
              {entries.map((entry, index) => (
                <Card key={index}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {entry.title}
                    </Typography>
                    <Typography variant="body2">
                      {entry.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        ))}

        {/* Footer */}
        <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary">
            This information is confidential and shared via Manyla's secure platform.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please do not share the access code or take screenshots.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};