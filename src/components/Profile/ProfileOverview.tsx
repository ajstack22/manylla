import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  GridLegacy as Grid,
  Button,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ChildProfile, Entry, QuickInfoConfig } from '../../types/ChildProfile';
import { CategorySection } from './CategorySection';
import { getVisibleCategories } from '../../utils/defaultCategories';
import { getVisibleQuickInfo } from '../../utils/defaultQuickInfo';
import { QuickInfoManager } from '../Settings/QuickInfoManager';
import { CategoryManager } from '../Settings/CategoryManager';
import { ProfileEditDialog } from './ProfileEditDialog';
import { CategoryConfig } from '../../types/ChildProfile';

interface ProfileOverviewProps {
  profile: ChildProfile;
  onAddEntry?: (category: string) => void;
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
  onShare?: () => void;
  onUpdateQuickInfo?: (panels: QuickInfoConfig[]) => void;
  onUpdateCategories?: (categories: CategoryConfig[]) => void;
  onUpdateProfile?: (updates: Partial<ChildProfile>) => void;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  profile,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onShare,
  onUpdateQuickInfo,
  onUpdateCategories,
  onUpdateProfile,
}) => {
  const [quickInfoOpen, setQuickInfoOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  
  const getEntriesByCategory = (category: string) => 
    profile.entries.filter(entry => entry.category === category);
    
  const visibleCategories = getVisibleCategories(profile.categories);
  const visibleQuickInfo = getVisibleQuickInfo(profile.quickInfoPanels);

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
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
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
              <Typography variant="h4" gutterBottom>
                {profile.preferredName || profile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Age: {calculateAge(profile.dateOfBirth)} years
              </Typography>
              {profile.pronouns && (
                <Chip label={profile.pronouns} size="small" sx={{ mt: 1 }} />
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Box sx={{ position: 'relative' }}>
              {onUpdateQuickInfo && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => setQuickInfoOpen(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Manage Quick Info
                  </Button>
                </Box>
              )}
              <Grid container spacing={2}>
                {visibleQuickInfo.map((panel) => 
                  panel.value && (
                    <Grid item xs={12} sm={6} key={panel.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="overline" color="text.secondary">
                            {panel.displayName}
                          </Typography>
                          <Typography variant="body2">
                            {panel.value}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
        
      </Paper>

      <Box sx={{ position: 'relative' }}>
        {onUpdateCategories && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              size="small"
              startIcon={<SettingsIcon />}
              onClick={() => setCategoriesOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Manage Categories
            </Button>
          </Box>
        )}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {visibleCategories.map((category) => (
            <Grid item xs={12} md={6} key={category.id}>
              <CategorySection
                title={category.displayName}
                entries={getEntriesByCategory(category.name)}
                color={category.color}
                icon={null}
                onAddEntry={onAddEntry ? () => onAddEntry(category.name) : undefined}
                onEditEntry={onEditEntry}
                onDeleteEntry={onDeleteEntry}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {onUpdateQuickInfo && (
        <QuickInfoManager
          open={quickInfoOpen}
          onClose={() => setQuickInfoOpen(false)}
          quickInfoPanels={profile.quickInfoPanels}
          onUpdate={onUpdateQuickInfo}
        />
      )}
      
      {onUpdateCategories && (
        <CategoryManager
          open={categoriesOpen}
          onClose={() => setCategoriesOpen(false)}
          categories={profile.categories}
          onUpdate={onUpdateCategories}
        />
      )}
      
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