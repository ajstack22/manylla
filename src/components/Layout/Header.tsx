import React, { useState } from 'react';
import {
  AppBar,
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
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  CloudUpload as CloudUploadIcon,
  CloudDone as CloudDoneIcon,
  ErrorOutline as CloudAlertIcon,
  Logout as LogoutIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onMenuClick?: () => void;
  onSyncClick?: () => void;
  onCloseProfile?: () => void;
  onShare?: () => void;
  onCategoriesClick?: () => void;
  syncStatus?: 'not-setup' | 'synced' | 'error';
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  onSyncClick, 
  onCloseProfile, 
  onShare, 
  onCategoriesClick,
  syncStatus = 'not-setup' 
}) => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Get sync icon based on status
  const getSyncIcon = () => {
    switch(syncStatus) {
      case 'synced':
        return <CloudDoneIcon />;
      case 'error':
        return <CloudAlertIcon />;
      case 'not-setup':
      default:
        return <CloudUploadIcon />;
    }
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ 
      backgroundColor: theme.palette.mode === 'light' 
        ? theme.palette.primary.main + '0A'  // 4% opacity of primary color
        : theme.palette.primary.main + '14', // 8% opacity for dark mode
      borderBottom: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.primary,
      boxShadow: 'none',
      backdropFilter: 'blur(8px)',
    }}>
      <Toolbar>
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'visible' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-2px',
              lineHeight: 1,
              fontSize: '48px',
              display: 'inline-block',
              paddingBottom: '8px',
              paddingTop: '4px',
              overflow: 'visible',
              height: 'auto',
            }}
          >
            manylla
          </Typography>
        </Box>

        {/* Mobile view - show Categories and Menu */}
        {isMobile ? (
          <>
            {onCategoriesClick && (
              <IconButton onClick={onCategoriesClick} color="inherit" sx={{ mr: 1 }} title="Manage Categories">
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
                <MenuItem onClick={() => { onShare(); setAnchorEl(null); }}>
                  <ListItemIcon><ShareIcon /></ListItemIcon>
                  <ListItemText>Share</ListItemText>
                </MenuItem>
              )}
              {onSyncClick && (
                <MenuItem onClick={() => { onSyncClick(); setAnchorEl(null); }}>
                  <ListItemIcon>{getSyncIcon()}</ListItemIcon>
                  <ListItemText>Sync</ListItemText>
                </MenuItem>
              )}
              <MenuItem onClick={() => { toggleTheme(); setAnchorEl(null); }}>
                <ListItemIcon>
                  {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                </ListItemIcon>
                <ListItemText>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</ListItemText>
              </MenuItem>
              {onCloseProfile && (
                <MenuItem onClick={() => { onCloseProfile(); setAnchorEl(null); }}>
                  <ListItemIcon><LogoutIcon /></ListItemIcon>
                  <ListItemText>Close Profile</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          /* Desktop view - show all buttons */
          <>
            {onCategoriesClick && (
              <IconButton onClick={onCategoriesClick} color="inherit" sx={{ mr: 1 }} title="Manage Categories">
                <LabelIcon />
              </IconButton>
            )}
            {onShare && (
              <IconButton onClick={onShare} color="inherit" sx={{ mr: 1 }} title="Share Profile">
                <ShareIcon />
              </IconButton>
            )}
            {onSyncClick && (
              <IconButton onClick={onSyncClick} color="inherit" sx={{ mr: 1 }} title="Sync">
                {getSyncIcon()}
              </IconButton>
            )}
            <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 1 }} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            {onCloseProfile && (
              <IconButton onClick={onCloseProfile} color="inherit" title="Close Profile">
                <LogoutIcon />
              </IconButton>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};