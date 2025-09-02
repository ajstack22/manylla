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
  CloudSync as CloudSyncIcon,
  Logout as LogoutIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onMenuClick?: () => void;
  onSyncClick?: () => void;
  onCloseProfile?: () => void;
  onShare?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onSyncClick, onCloseProfile, onShare }) => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

        {/* Mobile view - show only Share and Menu */}
        {isMobile ? (
          <>
            {onShare && (
              <IconButton onClick={onShare} color="inherit" sx={{ mr: 1 }} title="Share Profile">
                <ShareIcon />
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
              {onSyncClick && (
                <MenuItem onClick={() => { onSyncClick(); setAnchorEl(null); }}>
                  <ListItemIcon><CloudSyncIcon /></ListItemIcon>
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
            {onShare && (
              <IconButton onClick={onShare} color="inherit" sx={{ mr: 1 }} title="Share Profile">
                <ShareIcon />
              </IconButton>
            )}
            {onCloseProfile && (
              <IconButton onClick={onCloseProfile} color="inherit" sx={{ mr: 1 }} title="Close Profile">
                <LogoutIcon />
              </IconButton>
            )}
            {onSyncClick && (
              <IconButton onClick={onSyncClick} color="inherit" sx={{ mr: 1 }} title="Sync">
                <CloudSyncIcon />
              </IconButton>
            )}
            <IconButton onClick={toggleTheme} color="inherit" title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};