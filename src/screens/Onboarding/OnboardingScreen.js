import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import platform from '../../utils/platform';
import { useTheme } from '../../context/ThemeContext';
import { getScrollViewProps } from '../../utils/platformStyles';

// Hooks
import { useOnboardingForm } from './hooks/useOnboardingForm';
import { usePhotoUpload } from './hooks/usePhotoUpload';
import { useDateFormatter } from './hooks/useDateFormatter';

// Components
import OnboardingStep1 from './components/OnboardingStep1';
import OnboardingStep2 from './components/OnboardingStep2';

// Utils
import {
  createInitialProfile,
  createDemoProfile,
  saveProfile,
  clearAllProfiles,
} from './utils/profileCreation';

/**
 * Main onboarding screen - Simplified orchestrator
 * Complexity reduced from 37 to ~8 by extracting hooks, components, and utilities
 */
const OnboardingScreen = ({ onComplete, onShowPrivacy }) => {
  const { colors } = useTheme();
  const form = useOnboardingForm();
  const photo = usePhotoUpload();
  const dateFormatter = useDateFormatter();

  const handleStartFresh = () => {
    form.goToStep(1);
  };

  const handleDemoMode = async () => {
    if (onComplete) {
      onComplete({ mode: 'demo' });
      return;
    }

    await clearAllProfiles();
    const demoProfile = createDemoProfile();
    await saveProfile(demoProfile);
  };

  const handleJoinWithCode = async (code) => {
    if (onComplete) {
      onComplete({
        mode: 'join',
        accessCode: code,
      });
      return;
    }
  };

  const handleChildInfoSubmit = async () => {
    form.clearError();

    if (!form.isNameValid()) {
      form.setErrorMessage("Please enter the child's name");
      return;
    }

    if (onComplete) {
      onComplete({
        mode: 'fresh',
        childName: form.childName.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        photo: photo.photo || null,
      });
      return;
    }

    const newProfile = createInitialProfile({
      childName: form.childName,
      dateOfBirth: form.dateOfBirth,
      photo: photo.photo,
    });

    await saveProfile(newProfile);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      padding: 20,
      alignItems: 'center',
      paddingTop: platform.isWeb ? 60 : 40,
    },
  });

  const ScrollComponent = platform.isWeb ? View : ScrollView;

  if (form.step >= 1) {
    return (
      <ScrollComponent
        {...(!platform.isWeb ? getScrollViewProps() : {})}
        style={styles.container}
      >
        <View style={styles.scrollContent}>
          <OnboardingStep2
            childName={form.childName}
            dateOfBirth={form.dateOfBirth}
            photo={photo.photo}
            isProcessingPhoto={photo.isProcessingPhoto}
            photoError={photo.photoError}
            errorMessage={form.errorMessage}
            onChildNameChange={form.setChildName}
            onDateChange={(value) =>
              dateFormatter.handleDateChange(value, form.setDateOfBirth)
            }
            onPhotoPicker={photo.handlePhotoPicker}
            onClearPhoto={photo.clearPhoto}
            onBack={() => form.goToStep(0)}
            onSubmit={handleChildInfoSubmit}
            colors={colors}
          />
        </View>
      </ScrollComponent>
    );
  }

  return (
    <ScrollComponent
      {...(!platform.isWeb ? getScrollViewProps() : {})}
      style={styles.container}
    >
      <View style={styles.scrollContent}>
        <OnboardingStep1
          accessCode={form.accessCode}
          onAccessCodeChange={form.setAccessCode}
          onStartFresh={handleStartFresh}
          onDemoMode={handleDemoMode}
          onJoinWithCode={handleJoinWithCode}
          onShowPrivacy={onShowPrivacy}
          colors={colors}
        />
      </View>
    </ScrollComponent>
  );
};

export default OnboardingScreen;
