import React from "react";
import { Platform } from "react-native";
import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = "Loading...",
}) => {
  // Only render on web - React Native components should import the .native version
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return null;
  }

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
      open={open}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        {message && <Typography variant="body1">{message}</Typography>}
      </Box>
    </Backdrop>
  );
};
