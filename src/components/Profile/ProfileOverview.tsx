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
  Add as AddIcon,
} from '@mui/icons-material';
import { ChildProfile, Entry } from '../../types/ChildProfile';
import { CategorySection } from './CategorySection';
import { getVisibleCategories } from '../../utils/unifiedCategories';
import { UnifiedCategoryManager } from '../Settings/UnifiedCategoryManager';
import { ProfileEditDialog } from './ProfileEditDialog';
import { CategoryConfig } from '../../types/ChildProfile';
import { HtmlRenderer } from '../Forms/HtmlRenderer';

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
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  
  const getEntriesByCategory = (category: string) => 
    profile.entries.filter(entry => entry.category === category);
    
  const allCategories = getVisibleCategories(profile.categories);
  
  // Only show categories that have entries OR are priority categories (former Quick Info)
  const visibleCategories = allCategories.filter(category => {
    const entries = getEntriesByCategory(category.name);
    return entries.length > 0 || category.isQuickInfo;
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
            {/* Priority categories (former Quick Info) will now appear in main grid */}
          </Grid>
        </Grid>
        
      </Paper>

      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          {onAddEntry && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onAddEntry('')}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
              }}
            >
              Add Entry
            </Button>
          )}
          {onUpdateCategories && (
            <Button
              size="small"
              startIcon={<SettingsIcon />}
              onClick={() => setCategoriesOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Manage Categories
            </Button>
          )}
        </Box>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {visibleCategories.map((category) => {
            const entries = getEntriesByCategory(category.name);
            
            // For priority categories (former Quick Info), show as compact if only one entry
            if (category.isQuickInfo && entries.length <= 1) {
              return (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card variant="outlined" sx={{ borderLeft: `4px solid ${category.color}` }}>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {category.displayName}
                      </Typography>
                      {entries.length > 0 ? (
                        <HtmlRenderer content={entries[0].description} variant="body2" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No information added yet
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            }
            
            // Regular categories show as full sections
            return (
              <Grid item xs={12} md={6} key={category.id}>
                <CategorySection
                  title={category.displayName}
                  entries={entries}
                  color={category.color}
                  icon={null}
                  onAddEntry={undefined}
                  onEditEntry={onEditEntry}
                  onDeleteEntry={onDeleteEntry}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
      
      {onUpdateCategories && (
        <UnifiedCategoryManager
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