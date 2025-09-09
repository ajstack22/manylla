import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  Stack,
  Paper,
  Collapse,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  AppBar,
  Toolbar,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Share as ShareIcon,
  School as SchoolIcon,
  ChildCare as ChildCareIcon,
  LocalHospital as MedicalIcon,
  Settings as CustomIcon,
  QrCode2 as QrCodeIcon,
  Email as EmailIcon,
  Visibility as PreviewIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { ChildProfile } from "../../types/ChildProfile";
import { useMobileDialog } from "../../hooks/useMobileDialog";
import { manyllaColors } from "../../theme/theme";
import { QRCodeModal } from "./QRCodeModal";
import { API_ENDPOINTS } from "../../config/api";

interface ShareDialogOptimizedProps {
  open: boolean;
  onClose: () => void;
  profile: ChildProfile;
}

interface SharePreset {
  id: string;
  label: string;
  icon: React.ReactNode;
  categories: string[];
  description: string;
}

const sharePresets: SharePreset[] = [
  {
    id: "education",
    label: "Education",
    icon: <SchoolIcon />,
    categories: ["goals", "strengths", "challenges", "education", "behaviors"],
    description: "Educational needs & classroom support",
  },
  {
    id: "support",
    label: "Support",
    icon: <ChildCareIcon />,
    categories: ["quick-info", "behaviors", "tips-tricks", "daily-care"],
    description: "Care instructions & helpful tips",
  },
  {
    id: "medical",
    label: "Medical",
    icon: <MedicalIcon />,
    categories: [
      "quick-info",
      "medical",
      "therapies",
      "behaviors",
      "challenges",
    ],
    description: "Health information & medical history",
  },
  {
    id: "custom",
    label: "Custom",
    icon: <CustomIcon />,
    categories: [],
    description: "Choose exactly what to share",
  },
];

export const ShareDialogOptimized: React.FC<ShareDialogOptimizedProps> = ({
  open,
  onClose,
  profile,
}) => {
  const { mobileDialogProps, isMobile } = useMobileDialog();
  const [step, setStep] = useState<"configure" | "complete">("configure");

  // Configuration state
  const [selectedPreset, setSelectedPreset] = useState<string>("education");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expirationDays, setExpirationDays] = useState<number>(7);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Complete state
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("configure");
      setSelectedPreset("education");
      const educationPreset = sharePresets.find((p) => p.id === "education");
      setSelectedCategories(educationPreset?.categories || []);
      setExpirationDays(7);
      setIncludePhoto(false);
      setShowPreview(false);
      setGeneratedLink("");
      setCopiedLink(false);
    }
  }, [open]);

  // Auto-select categories when preset changes
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = sharePresets.find((p) => p.id === presetId);
    if (preset && presetId !== "custom") {
      setSelectedCategories(preset.categories);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleGenerateLink = async () => {
    // Generate invite code in XXXX-XXXX format (matching StackMap)
    const { generateInviteCode } = require("../../utils/inviteCode");
    const token = generateInviteCode();

    // Generate 32-byte encryption key
    const shareKey = nacl.randomBytes(32);

    // Prepare share data
    const sharedProfile = {
      ...profile,
      entries: profile.entries.filter((entry) =>
        selectedCategories.includes(entry.category),
      ),
      photo: includePhoto ? profile.photo : "",
      quickInfoPanels: [],
    };

    const shareData = {
      profile: sharedProfile,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + expirationDays * 24 * 60 * 60 * 1000,
      ).toISOString(),
      version: 2, // Version 2 indicates encrypted share
    };

    // Encrypt the share data
    const nonce = nacl.randomBytes(24);
    const messageBytes = util.decodeUTF8(JSON.stringify(shareData));
    const encrypted = nacl.secretbox(messageBytes, nonce, shareKey);

    // Combine nonce + ciphertext
    const encryptedBlob = util.encodeBase64(
      new Uint8Array([...nonce, ...encrypted]),
    );

    // Phase 3: Store encrypted share in database via API
    try {
      const response = await fetch(API_ENDPOINTS.share.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_code: token,
          encrypted_data: encryptedBlob,
          recipient_type: selectedPreset,
          expiry_hours: expirationDays * 24,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[ShareDialog] Failed to create share:", error);
        // Handle error - you might want to show an error message
        return;
      }

      const result = await response.json();
      // console.log('[ShareDialog] Share created successfully:', result);
    } catch (error) {
      console.error("[ShareDialog] Failed to create share:", error);
      // Handle error - you might want to show an error message
      return;
    }

    // Generate link with key in fragment
    const getShareDomain = () => {
      if (process.env.REACT_APP_SHARE_DOMAIN) {
        return process.env.REACT_APP_SHARE_DOMAIN;
      }
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      if (pathname.startsWith("/qual")) {
        return `${origin}/qual`;
      }
      return origin;
    };

    const shareDomain = getShareDomain();
    const keyBase64 = util.encodeBase64(shareKey);
    // Use path format for shares
    setGeneratedLink(`${shareDomain}/share/${token}#${keyBase64}`);
    setStep("complete");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getSelectedEntriesCount = () => {
    return profile.entries.filter((entry) =>
      selectedCategories.includes(entry.category),
    ).length;
  };

  const renderConfigureStep = () => (
    <Stack spacing={3}>
      {/* Preset Selection */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Who are you sharing with?
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {sharePresets.map((preset) => (
            <Paper
              key={preset.id}
              elevation={0}
              sx={{
                flex: isMobile ? "1 1 calc(50% - 4px)" : "0 0 auto",
                minWidth: isMobile ? 0 : 120,
                p: 1.5,
                cursor: "pointer",
                border: "2px solid",
                borderColor:
                  selectedPreset === preset.id ? "primary.main" : "divider",
                borderRadius: 2,
                backgroundColor:
                  selectedPreset === preset.id
                    ? "action.selected"
                    : "background.paper",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => handlePresetChange(preset.id)}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    color:
                      selectedPreset === preset.id
                        ? "primary.main"
                        : "text.secondary",
                  }}
                >
                  {preset.icon}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: selectedPreset === preset.id ? 600 : 400 }}
                >
                  {preset.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
        {selectedPreset && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {sharePresets.find((p) => p.id === selectedPreset)?.description}
          </Typography>
        )}
      </Box>

      {/* Categories Selection (show for custom or allow modification) */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Information to share
          </Typography>
          {selectedCategories.length > 0 && (
            <Typography variant="caption" color="primary">
              {getSelectedEntriesCount()} entries
              {includePhoto ? " + photo" : ""} selected
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {/* Photo option */}
          <Chip
            label="Photo"
            onClick={() => setIncludePhoto(!includePhoto)}
            color={includePhoto ? "primary" : "default"}
            variant={includePhoto ? "filled" : "outlined"}
            size="medium"
            icon={<PersonIcon />}
            sx={{ fontWeight: 600 }}
          />

          {/* Category options */}
          {profile.categories
            .filter((cat) => cat.isVisible)
            .map((category) => (
              <Chip
                key={category.id}
                label={category.displayName}
                onClick={() => handleCategoryToggle(category.name)}
                color={
                  selectedCategories.includes(category.name)
                    ? "primary"
                    : "default"
                }
                variant={
                  selectedCategories.includes(category.name)
                    ? "filled"
                    : "outlined"
                }
                size="medium"
                sx={{
                  ...(category.isQuickInfo && {
                    fontWeight: 600,
                    borderWidth: selectedCategories.includes(category.name)
                      ? 0
                      : 2,
                  }),
                }}
              />
            ))}
        </Box>
      </Box>

      {/* Expiration */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Access expires in
        </Typography>
        <ToggleButtonGroup
          value={expirationDays}
          exclusive
          onChange={(e, value) => value && setExpirationDays(value)}
          size="small"
          fullWidth
        >
          <ToggleButton value={7}>7 days</ToggleButton>
          <ToggleButton value={30}>30 days</ToggleButton>
          <ToggleButton value={90}>3 months</ToggleButton>
          <ToggleButton value={180}>6 months</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Preview Button */}
      <Box>
        <Button
          size="small"
          onClick={() => setShowPreview(!showPreview)}
          startIcon={<PreviewIcon />}
          variant="text"
        >
          {showPreview ? "Hide" : "Show"} preview ({getSelectedEntriesCount()}{" "}
          entries)
        </Button>
        <Collapse in={showPreview}>
          <Paper
            sx={{
              mt: 1,
              p: 2,
              bgcolor: "background.default",
              maxHeight: 200,
              overflow: "auto",
            }}
          >
            {profile.entries
              .filter((entry) => selectedCategories.includes(entry.category))
              .slice(0, 5)
              .map((entry) => (
                <Box key={entry.id} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {
                      profile.categories.find((c) => c.name === entry.category)
                        ?.displayName
                    }
                  </Typography>
                  <Typography variant="body2">{entry.title}</Typography>
                </Box>
              ))}
            {getSelectedEntriesCount() > 5 && (
              <Typography variant="caption" color="text.secondary">
                ...and {getSelectedEntriesCount() - 5} more entries
              </Typography>
            )}
          </Paper>
        </Collapse>
      </Box>
    </Stack>
  );

  const renderCompleteStep = () => (
    <Stack spacing={3}>
      <Alert
        severity="success"
        sx={{ bgcolor: manyllaColors.lightManilaAccent }}
      >
        Share link created successfully! This link will expire in{" "}
        {expirationDays <= 30
          ? `${expirationDays} ${expirationDays === 1 ? "day" : "days"}`
          : expirationDays === 90
            ? "3 months"
            : "6 months"}
        .
      </Alert>

      {/* Share Link */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Share Link
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            value={generatedLink}
            size="small"
            fullWidth
            InputProps={{
              readOnly: true,
              sx: { fontFamily: "monospace", fontSize: "0.875rem" },
            }}
          />
          <Tooltip title={copiedLink ? "Copied!" : "Copy link"}>
            <IconButton
              onClick={handleCopyLink}
              color={copiedLink ? "success" : "default"}
            >
              {copiedLink ? <CheckIcon /> : <CopyIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Security Info */}
      <Paper sx={{ p: 2, bgcolor: "background.default" }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          🔒 Secure Share
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This link contains an encrypted version of the selected information.
          The encryption key is included in the link and never sent to any
          server. Only someone with this exact link can view the shared
          information.
        </Typography>
      </Paper>

      {/* Share Options */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Share via
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => {
              const subject = `${profile.preferredName || profile.name}'s Information`;
              const expiration =
                expirationDays <= 30
                  ? `${expirationDays} ${expirationDays === 1 ? "day" : "days"}`
                  : expirationDays === 90
                    ? "3 months"
                    : "6 months";
              const body = `Here's a secure encrypted link to view ${profile.preferredName || profile.name}'s information:\n\n${generatedLink}\n\nThis link will expire in ${expiration}.\n\nNote: This link contains encrypted data. Please use the complete link exactly as provided.`;
              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }}
          >
            Email
          </Button>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={() => setShowQRCode(true)}
          >
            QR Code
          </Button>
        </Stack>
      </Box>

      <Divider />

      {/* Share Another */}
      <Button
        variant="text"
        onClick={() => {
          setStep("configure");
          setSelectedPreset("education");
          const educationPreset = sharePresets.find(
            (p) => p.id === "education",
          );
          setSelectedCategories(educationPreset?.categories || []);
          setIncludePhoto(false);
        }}
        startIcon={<ShareIcon />}
      >
        Create another share
      </Button>
    </Stack>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        {...(isMobile ? mobileDialogProps : {})}
      >
        {isMobile ? (
          <AppBar position="static" sx={{ bgcolor: manyllaColors.brown }}>
            <Toolbar>
              <IconButton
                edge="start"
                onClick={onClose}
                sx={{ color: "white" }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1, color: "white" }}>
                Share Profile
              </Typography>
              {step === "configure" && (
                <Button
                  color="inherit"
                  onClick={handleGenerateLink}
                  disabled={selectedCategories.length === 0}
                  endIcon={<ArrowForwardIcon />}
                >
                  Generate
                </Button>
              )}
            </Toolbar>
          </AppBar>
        ) : (
          <Box sx={{ p: 2, pb: 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                {step === "configure" ? "Create Share Link" : "Share Created!"}
              </Typography>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        <DialogContent sx={{ pb: 3 }}>
          {step === "configure" ? renderConfigureStep() : renderCompleteStep()}
        </DialogContent>

        {!isMobile && step === "configure" && (
          <Box sx={{ p: 2, pt: 0 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateLink}
              disabled={selectedCategories.length === 0}
              endIcon={<ArrowForwardIcon />}
              size="large"
            >
              Generate Share Link
            </Button>
          </Box>
        )}

        {!isMobile && step === "complete" && (
          <Box sx={{ p: 2, pt: 0 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={onClose}
              size="large"
            >
              Done
            </Button>
          </Box>
        )}
      </Dialog>

      <QRCodeModal
        open={showQRCode}
        onClose={() => setShowQRCode(false)}
        url={generatedLink}
        title="Share QR Code"
      />
    </>
  );
};
