import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Stack,
} from "@mui/material";
import {
  Share as ShareIcon,
  PlayCircle as PlayIcon,
  Add as AddIcon,
} from "@mui/icons-material";

interface OnboardingWizardProps {
  onComplete: (data: {
    mode: "fresh" | "join" | "demo";
    childName?: string;
    dateOfBirth?: string;
    photo?: string;
    accessCode?: string;
  }) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"fresh" | "join" | "demo" | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();

  const handleStartFresh = () => {
    setMode("fresh");
    setStep(1);
  };

  const handleJoinWithCode = () => {
    if (accessCode.length === 6) {
      onComplete({ mode: "join", accessCode: accessCode.toUpperCase() });
    }
  };

  const handleDemoMode = () => {
    onComplete({ mode: "demo" });
  };

  const handleChildInfoSubmit = () => {
    if (!childName.trim()) {
      return;
    }

    onComplete({
      mode: "fresh",
      childName: childName.trim(),
      dateOfBirth: dateOfBirth || undefined,
      photo: photo,
    });
  };

  const handlePhotoSelect = () => {
    // Simplified photo selection - just use a placeholder for now
    setPhoto("default");
  };

  if (step === 1) {
    return (
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Button
              onClick={() => setStep(0)}
              startIcon={<Typography>←</Typography>}
            >
              Back
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Child Information
            </Typography>
            <Box sx={{ width: 80 }} />
          </Stack>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 4 }}
          >
            Let's set up a profile for your child
          </Typography>
        </Box>

        <Stack spacing={3} alignItems="center">
          <Box sx={{ textAlign: "center" }}>
            <Box
              onClick={handlePhotoSelect}
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "2px dashed",
                borderColor: "divider",
                mb: 1,
                "&:hover": { backgroundColor: "action.selected" },
              }}
            >
              <Typography variant="h2">{photo ? "👤" : "📷"}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Tap to add photo
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ width: "100%" }}>
            <TextField
              label="Child's Name *"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              fullWidth
              autoFocus
            />

            <TextField
              label="Date of Birth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              placeholder="MM/DD/YYYY"
              fullWidth
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center", fontStyle: "italic" }}
            >
              You can always add more details later
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="large"
            onClick={handleChildInfoSubmit}
            disabled={!childName.trim()}
            fullWidth
            sx={{ mt: 3 }}
          >
            Continue
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <img
          src="/manila.png"
          alt="Manylla Logo"
          style={{ height: 60, marginBottom: 12 }}
        />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome to Manylla
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your secure companion for managing your child's special needs journey
        </Typography>
      </Box>

      <Box
        sx={{ backgroundColor: "action.hover", p: 2, borderRadius: 2, mb: 3 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
          Manylla helps you:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Track developmental milestones
          <br />
          • Organize IEP goals and medical records
          <br />
          • Share information securely
          <br />• Sync across all your devices
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleStartFresh}
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
            inputProps={{ maxLength: 6, style: { textTransform: "uppercase" } }}
          />
          <Button
            variant="outlined"
            onClick={handleJoinWithCode}
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
          onClick={handleDemoMode}
          fullWidth
          color="secondary"
        >
          Try Demo with Ellie's Profile
        </Button>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 3, textAlign: "center" }}
      >
        All data is encrypted on your device. No account required.
      </Typography>
    </Container>
  );
};
