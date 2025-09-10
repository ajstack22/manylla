import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Menu as MenuIcon,
  CloudUpload as CloudUploadIcon,
  CloudDone as CloudDoneIcon,
  ErrorOutline as CloudAlertIcon,
  Logout as LogoutIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Label as LabelIcon,
} from "@mui/icons-material";
import { useTheme as useAppTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { HeaderProfile } from "./HeaderProfile";
import { ChildProfile } from "../../types/ChildProfile";

interface HeaderProps {
  onMenuClick?: () => void;
  onSyncClick?: () => void;
  onCloseProfile?: () => void;
  onShare?: () => void;
  onCategoriesClick?: () => void;
  onUpdateProfile?: () => void;
  syncStatus?: "not-setup" | "synced" | "error";
  isProfileHidden?: boolean;
  profile?: ChildProfile;
}

// Define consistent header height
export const HEADER_HEIGHT = 64; // Standard Material-UI toolbar height

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSyncClick,
  onCloseProfile,
  onShare,
  onCategoriesClick,
  onUpdateProfile,
  syncStatus = "not-setup",
  isProfileHidden = false,
  profile,
}) => {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useAppTheme();
  const { showInfo } = useToast();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [collapsedButtons, setCollapsedButtons] = useState<string[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const profileNameRef = useRef<HTMLDivElement>(null);

  const handleThemeToggle = () => {
    toggleTheme();
    const nextMode =
      themeMode === "light"
        ? "Dark"
        : themeMode === "dark"
          ? "Manylla"
          : "Light";
    showInfo(`${nextMode} Mode`);
  };

  // Get sync icon based on status
  const getSyncIcon = () => {
    switch (syncStatus) {
      case "synced":
        return <CloudDoneIcon />;
      case "error":
        return <CloudAlertIcon />;
      case "not-setup":
      default:
        return <CloudUploadIcon />;
    }
  };

  // Button definitions with priority (lower number = higher priority to keep visible)
  const buttonDefinitions = useMemo(() => {
    const buttons = [];
    if (onCategoriesClick) buttons.push({ id: "categories", priority: 1, width: 48, action: onCategoriesClick, icon: <LabelIcon />, title: "Manage Categories" });
    if (onShare) buttons.push({ id: "share", priority: 2, width: 48, action: onShare, icon: <ShareIcon />, title: "Share Profile" });
    if (onSyncClick) buttons.push({ id: "sync", priority: 3, width: 48, action: onSyncClick, icon: getSyncIcon(), title: "Sync" });
    buttons.push({ id: "theme", priority: 4, width: 48, action: handleThemeToggle, icon: <PaletteIcon />, title: "Theme" });
    if (onCloseProfile) buttons.push({ id: "closeProfile", priority: 5, width: 48, action: onCloseProfile, icon: <LogoutIcon />, title: "Close Profile" });
    return buttons;
  }, [onCategoriesClick, onShare, onSyncClick, onCloseProfile, syncStatus, handleThemeToggle]);

  // Calculate which buttons need to be collapsed based on available space
  useEffect(() => {
    if (!isProfileHidden || !profile || isMobile || isTablet) {
      setCollapsedButtons([]);
      return;
    }

    const calculateCollapse = () => {
      if (!headerRef.current || !profileNameRef.current) return;
      
      const headerWidth = headerRef.current.offsetWidth;
      const profileNameWidth = profileNameRef.current.offsetWidth;
      const minPadding = 32; // Minimum padding on right side
      const leftPadding = 16; // Space from left edge
      
      const availableSpace = headerWidth - profileNameWidth - leftPadding - minPadding;
      
      let currentWidth = 0;
      const toCollapse: string[] = [];
      
      // Sort buttons by priority (reverse order for collapsing)
      const sortedButtons = [...buttonDefinitions]
        .filter(btn => btn.action) // Only consider buttons that exist
        .sort((a, b) => b.priority - a.priority);
      
      for (const button of sortedButtons) {
        currentWidth += button.width + 8; // button width + margin
        if (currentWidth > availableSpace) {
          toCollapse.push(button.id);
        }
      }
      
      setCollapsedButtons(toCollapse);
    };

    // Calculate immediately and on resize
    calculateCollapse();
    const handleResize = () => calculateCollapse();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, [isProfileHidden, profile, isMobile, isTablet, buttonDefinitions]);

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: HEADER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        backgroundColor:
          theme.palette.mode === "light"
            ? theme.palette.primary.main + "0A" // 4% opacity of primary color
            : theme.palette.primary.main + "14", // 8% opacity for dark mode
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)", // Safari support
        zIndex: 1200, // Higher z-index to ensure it's above everything
      }}
    >
      <Toolbar
        ref={headerRef}
        sx={{
          width: '100%',
          minHeight: HEADER_HEIGHT,
          height: HEADER_HEIGHT,
          px: { xs: 1, sm: 2 },
        }}>
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            overflow: "visible",
          }}
        >
          <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-2px",
                lineHeight: 1,
                fontSize: "48px",
                display: "inline-block",
                paddingBottom: "8px",
                paddingTop: "4px",
                overflow: "visible",
                height: "auto",
                opacity: isProfileHidden && profile ? 0 : 1,
                transition: "opacity 0.2s ease",
                pointerEvents: isProfileHidden ? "none" : "auto",
              }}
            >
              manylla
            </Typography>
            {profile && (
              <div ref={profileNameRef}>
                <HeaderProfile
                  profile={profile}
                  visible={isProfileHidden}
                  onClick={onUpdateProfile}
                />
              </div>
            )}
          </Box>
        </Box>

        {/* Mobile view - show Categories and Menu */}
        {isMobile ? (
          <>
            {onCategoriesClick && (
              <IconButton
                onClick={onCategoriesClick}
                color="inherit"
                sx={{ mr: 1 }}
                title="Manage Categories"
              >
                <LabelIcon />
              </IconButton>
            )}
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              color="inherit"
              title="More options"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {onShare && (
                <MenuItem
                  onClick={() => {
                    onShare();
                    setAnchorEl(null);
                  }}
                >
                  <ListItemIcon>
                    <ShareIcon />
                  </ListItemIcon>
                  <ListItemText>Share</ListItemText>
                </MenuItem>
              )}
              {onSyncClick && (
                <MenuItem
                  onClick={() => {
                    onSyncClick();
                    setAnchorEl(null);
                  }}
                >
                  <ListItemIcon>{getSyncIcon()}</ListItemIcon>
                  <ListItemText>Sync</ListItemText>
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  handleThemeToggle();
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <PaletteIcon />
                </ListItemIcon>
                <ListItemText>Theme</ListItemText>
              </MenuItem>
              {onCloseProfile && (
                <MenuItem
                  onClick={() => {
                    onCloseProfile();
                    setAnchorEl(null);
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText>Close Profile</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          /* Desktop view - show all buttons or overflow menu */
          <>
            {/* Render visible buttons */}
            {buttonDefinitions
              .filter(btn => !collapsedButtons.includes(btn.id))
              .sort((a, b) => a.priority - b.priority)
              .map(btn => (
                <IconButton
                  key={btn.id}
                  onClick={btn.action}
                  color="inherit"
                  sx={{ mr: 1 }}
                  title={btn.title}
                >
                  {btn.icon}
                </IconButton>
              ))}
            
            {/* Show overflow menu if any buttons are collapsed */}
            {collapsedButtons.length > 0 && (
              <>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  color="inherit"
                  title="More options"
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  {buttonDefinitions
                    .filter(btn => collapsedButtons.includes(btn.id))
                    .sort((a, b) => a.priority - b.priority)
                    .map(btn => (
                      <MenuItem
                        key={btn.id}
                        onClick={() => {
                          btn.action();
                          setAnchorEl(null);
                        }}
                      >
                        <ListItemIcon>{btn.icon}</ListItemIcon>
                        <ListItemText>{btn.title}</ListItemText>
                      </MenuItem>
                    ))}
                </Menu>
              </>
            )}
          </>
        )}
      </Toolbar>
    </Box>
  );
};
