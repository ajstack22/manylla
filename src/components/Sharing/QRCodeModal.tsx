import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { QRCodeCanvas } from "qrcode.react";
import { manyllaColors } from "../../theme/theme";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  open,
  onClose,
  url,
  title = "Share QR Code",
}) => {
  const downloadQRCode = () => {
    const canvas = document.getElementById(
      "qr-code-canvas",
    ) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "manylla-share-qr.png";
      link.click();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              p: 3,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <QRCodeCanvas
              id="qr-code-canvas"
              value={url}
              size={200}
              level="H"
              includeMargin
              fgColor={manyllaColors.brown}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Recipients can scan this QR code to access the shared information
          </Typography>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadQRCode}
            fullWidth
          >
            Download QR Code
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
