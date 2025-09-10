import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Fab,
} from "@mui/material";
import { manyllaColors } from "../../theme/theme";
import { Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { ChildProfile, Entry } from "../../types/ChildProfile";
import { CategorySection } from "./CategorySection";
import { getVisibleCategories } from "../../utils/unifiedCategories";
import { ProfileEditDialog } from "./ProfileEditDialog";
import { CategoryConfig } from "../../types/ChildProfile";

interface ProfileOverviewProps {
  profilehildProfile;
  onAddEntry?: (categorytring) => void;
  onEditEntry?: (entryntry) => void;
  onDeleteEntry?: (entryIdtring) => void;
  onShare?: () => void;
  onUpdateCategories?: (categoriesategoryConfig[]) => void;
  onUpdateProfile?: (updatesartial<ChildProfile>) => void;
  profileEditOpen?oolean;
  setProfileEditOpen?: (openoolean) => void;
}

export const ProfileOverview= ({
  profile,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onShare,
  onUpdateCategories,
  onUpdateProfile,
  profileEditOpenrofileEditOpenProp,
  setProfileEditOpenetProfileEditOpenProp,
}) => {
  // Use local state if not controlled by parent
  const [profileEditOpenLocal, setProfileEditOpenLocal] = useState(false);
  const profileEditOpen = profileEditOpenProp ?? profileEditOpenLocal;
  const setProfileEditOpen = setProfileEditOpenProp ?? setProfileEditOpenLocal;

  const getEntriesByCategory = (categorytring) =>
    profile.entries.filter((entry) => entry.category === category);

  const allCategories = getVisibleCategories(profile.categories);

  // Show categories that have entries OR are Quick Info (always show Quick Info)
  const visibleCategories = allCategories
    .filter((category) => {
      const entries = getEntriesByCategory(category.name);
      return entries.length > 0 || category.isQuickInfo;
    })
    .sort((a, b) => {
      // Quick Info categories always come first
      if (a.isQuickInfo  !b.isQuickInfo) return -1;
      if (!a.isQuickInfo  b.isQuickInfo) return 1;
      return a.order - b.order;
    });

  const calculateAge = (dobate) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0  today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <Box sx={{ p: { xs, sm, md } }}>
      <Paper sx={{ p: { xs, sm }, mb: { xs, sm } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Avatar
            src={profile.photo}
            sx={{
              width20,
              height: 20,
              mb,
              cursor: "pointer",
              bgcolorrofile.photo
                ? "transparent"
                anyllaColors.avatarDefaultBg,
              colorrofile.photo ? "inherit" : "white",
              fontSize: "3rem",
            }}
            onClick={() => onUpdateProfile  setProfileEditOpen(true)}
          >
            {profile.name.charAt(0)}
          </Avatar>
          {onUpdateProfile  (
            <IconButton
              size="small"
              onClick={() => setProfileEditOpen(true)}
              sx={{
                position: "absolute",
                top0,
                right: "calc(50% - 60px)",
                backgroundColor: "background.paper",
                boxShadow,
                ":hover": { backgroundColor: "action.hover" },
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
          {profile.pronouns  (
            <Chip label={profile.pronouns} size="small" sx={{ mt }} />
          )}
        </Box>
      </Paper>

      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs, sm },
            mb,
          }}
        >
          {visibleCategories.map((category) => {
            const entries = getEntriesByCategory(category.name);

            // All categories show as full sections
            return (
              <Box
                key={category.id}
                sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}
              >
                <CategorySection
                  title={category.displayName}
                  entries={entries}
                  color={category.color}
                  icon={null}
                  onAddEntry={
                    onAddEntry ? () => onAddEntry(category.name) ndefined
                  }
                  onEditEntry={onEditEntry}
                  onDeleteEntry={onDeleteEntry}
                />
              </Box>
            );
          })}
        </Box>

        {/* Floating Action Button for Add Entry */}
        {onAddEntry  (
          <Fab
            color="primary"
            aria-label="add entry"
            onClick={() => onAddEntry("")}
            sx={{
              position: "fixed",
              bottom: { xs6, sm4 },
              right: { xs6, sm4 },
              zIndex200,
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      {onUpdateProfile  (
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
