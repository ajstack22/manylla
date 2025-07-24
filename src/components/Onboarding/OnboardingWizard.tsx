import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Stack,
} from '@mui/material';
import {
  Share as ShareIcon,
  PlayCircle as PlayIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface OnboardingWizardProps {
  onStartFresh: () => void;
  onJoinWithCode: (code: string) => void;
  onDemoMode: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onStartFresh,
  onJoinWithCode,
  onDemoMode,
}) => {
  const [accessCode, setAccessCode] = useState('');

  return (
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img
            src="/manila.png"
            alt="Manyla Logo"
            style={{ height: 60, marginBottom: 12 }}
          />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome to Manyla
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your secure companion for managing your child's special needs journey
          </Typography>
        </Box>

        <Box sx={{ backgroundColor: 'action.hover', p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Manyla helps you:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Track developmental milestones<br />
            • Organize IEP goals and medical records<br />
            • Share information securely<br />
            • Sync across all your devices
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={onStartFresh}
            fullWidth
          >
            Start Fresh
          </Button>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="Have an access code?"
              fullWidth
              size="small"
              inputProps={{ maxLength: 6, style: { textTransform: 'uppercase' } }}
            />
            <Button
              variant="outlined"
              onClick={() => onJoinWithCode(accessCode)}
              disabled={accessCode.length !== 6}
              startIcon={<ShareIcon />}
              size="small"
            >
              Join
            </Button>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<PlayIcon />}
            onClick={onDemoMode}
            fullWidth
            color="secondary"
          >
            Try Demo with Ellie's Profile
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          All data is encrypted on your device. No account required.
        </Typography>
      </Container>
  );
};