import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Fab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { ChildProfile, Entry } from '../../types/ChildProfile';
import { CategorySection } from './CategorySection';
import { getVisibleCategories } from '../../utils/unifiedCategories';
import { ProfileEditDialog } from './ProfileEditDialog';
import { CategoryConfig } from '../../types/ChildProfile';

interface ProfileOverviewProps {
  profile: ChildProfile;
  onAddEntry?: (category: string) => void;
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
  onShare?: () => void;
  onUpdateCategories?: (categories: CategoryConfig[]) => void;
  onUpdateProfile?: (updates: Partial<ChildProfile>) => void;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  profile,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onShare,
  onUpdateCategories,
  onUpdateProfile,
}) => {
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  
  const getEntriesByCategory = (category: string) => 
    profile.entries.filter(entry => entry.category === category);
    
  const allCategories = getVisibleCategories(profile.categories);
  
  // Show categories that have entries OR are Quick Info (always show Quick Info)
  const visibleCategories = allCategories.filter(category => {
    const entries = getEntriesByCategory(category.name);
    return entries.length > 0 || category.isQuickInfo;
  }).sort((a, b) => {
    // Quick Info categories always come first
    if (a.isQuickInfo && !b.isQuickInfo) return -1;
    if (!a.isQuickInfo && b.isQuickInfo) return 1;
    return a.order - b.order;
  });

  const calculateAge = (dob: Date) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Avatar
            src={profile.photo}
            sx={{ width: 120, height: 120, mb: 2, cursor: 'pointer' }}
            onClick={() => onUpdateProfile && setProfileEditOpen(true)}
          >
            {profile.name.charAt(0)}
          </Avatar>
          {onUpdateProfile && (
            <IconButton
              size="small"
              onClick={() => setProfileEditOpen(true)}
              sx={{ 
                position: 'absolute', 
                top: 90, 
                right: 'calc(50% - 60px)',
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              title="Edit Profile"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h4" gutterBottom align="center">
            {profile.preferredName || profile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Age: {calculateAge(profile.dateOfBirth)} years
          </Typography>
          {profile.pronouns && (
            <Chip label={profile.pronouns} size="small" sx={{ mt: 1 }} />
          )}
        </Box>
      </Paper>

      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, mb: 8 }}>
          {visibleCategories.map((category) => {
            const entries = getEntriesByCategory(category.name);
            
            // All categories show as full sections
            return (
              <Box key={category.id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                <CategorySection
                  title={category.displayName}
                  entries={entries}
                  color={category.color}
                  icon={null}
                  onAddEntry={onAddEntry ? () => onAddEntry(category.name) : undefined}
                  onEditEntry={onEditEntry}
                  onDeleteEntry={onDeleteEntry}
                />
              </Box>
            );
          })}
        </Box>
        
        {/* Floating Action Button for Add Entry */}
        {onAddEntry && (
          <Fab
            color="primary"
            aria-label="add entry"
            onClick={() => onAddEntry('')}
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 24 },
              right: { xs: 16, sm: 24 },
              zIndex: 1200,
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
      
      {onUpdateProfile && (
        <ProfileEditDialog
          open={profileEditOpen}
          onClose={() => setProfileEditOpen(false)}
          profile={profile}
          onSave={onUpdateProfile}
        />
      )}
    </Box>
  );
};