import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { ChildProfile } from "../../types/ChildProfile";

interface HeaderProfileProps {
  profile: ChildProfile;
  visible: boolean;
  onClick?: () => void;
}

export const HeaderProfile: React.FC<HeaderProfileProps> = ({
  profile,
  visible,
  onClick,
}) => {
  // Use manila envelope color for default avatar background
  const manyllaColors = {
    avatarDefaultBg: "#F4E4C1",
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
        willChange: "opacity",
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%) translateZ(0)", // Combined transform for centering and GPU acceleration
        cursor: onClick ? "pointer" : "default",
        minHeight: 44, // Touch target
        pointerEvents: visible ? "auto" : "none", // Prevent clicks when invisible
        zIndex: visible ? 2 : 0, // Ensure it's above manylla text when visible
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && visible ? 0 : -1}
      onKeyPress={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
    >
      {profile.photo ? (
        <Avatar
          src={profile.photo}
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 1.5,
          }}
          alt={profile.name}
        />
      ) : (
        <Avatar
          sx={{
            width: 40,
            height: 40,
            mr: 1.5,
            bgcolor: manyllaColors.avatarDefaultBg,
            color: "#8B7355", // Darker manila for text contrast
            fontWeight: 600,
          }}
        >
          {profile.name?.[0]?.toUpperCase()}
        </Avatar>
      )}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "300px", // Prevent overly long names from breaking layout
        }}
      >
        {profile.name}
      </Typography>
    </Box>
  );
};