/**
 * Manylla - Cross-Platform App
 * Following StackMap's pattern: single codebase with Platform.OS checks
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform-specific imports
let GestureHandlerRootView = View; // Default to View
let SafeAreaProvider = ({ children }) => children; // Default passthrough

if (Platform.OS !== 'web') {
  // Mobile-only imports
  try {
    const GestureHandler = require('react-native-gesture-handler');
    GestureHandlerRootView = GestureHandler.GestureHandlerRootView || View;
  } catch (e) {
    console.log('Gesture handler not available');
  }
  
  try {
    const SafeArea = require('react-native-safe-area-context');
    SafeAreaProvider = SafeArea.SafeAreaProvider || (({ children }) => children);
  } catch (e) {
    console.log('Safe area not available');
  }
}

// Shared imports
import { ThemeProvider } from './src/context/ThemeContext';
import { SyncProvider, useSync } from './src/context/SyncContext';
import { OnboardingWizard } from './src/components/Onboarding';
import { StorageService } from './src/services/storage/storageService';
import { unifiedCategories } from './src/utils/unifiedCategories';

// Platform-specific ProfileOverview
const ProfileOverview = Platform.OS === 'web'
  ? require('./src/components/Profile/ProfileOverview').ProfileOverview
  : require('./src/components/Profile/ProfileOverview.native').default;

// Web-specific early sync data capture (from StackMap pattern)
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // Check for share URL pattern
  const pathname = window.location.pathname;
  const shareMatch = pathname.match(/\/share\/([a-zA-Z0-9-]+)/);
  
  if (shareMatch) {
    const token = shareMatch[1];
    const hash = window.location.hash.substring(1);
    window.__earlyShareData = { shareToken: token, encryptionKey: hash };
  }
  
  // Clear fragment to prevent sending to server
  if (window.location.hash) {
    window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }
}

// Main App content
function AppContent() {
  // const { pushProfile, syncStatus } = useSync(); // TEMPORARILY DISABLED
  const pushProfile = () => {}; // Dummy function
  const syncStatus = 'idle'; // Dummy status
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Check if onboarding completed
        const onboardingCompleted = await AsyncStorage.getItem('manylla_onboarding_completed') === 'true';
        const storedProfile = await StorageService.getProfile();
        
        if (onboardingCompleted && storedProfile && storedProfile.name) {
          const updatedProfile = {
            ...storedProfile,
            categories: unifiedCategories
          };
          setProfile(updatedProfile);
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
          // Clear invalid data
          if (!storedProfile?.name) {
            await AsyncStorage.removeItem('manylla_profile');
            await AsyncStorage.removeItem('manylla_onboarding_completed');
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Push profile changes to sync
  useEffect(() => {
    if (profile && !isLoading) {
      pushProfile(profile);
    }
  }, [profile, isLoading, pushProfile]);

  const handleOnboardingComplete = async (data) => {
    if (data.mode === 'demo') {
      // Create demo profile
      const demoProfile = {
        id: '1',
        name: 'Alex Johnson',
        preferredName: 'Alex',
        dateOfBirth: new Date('2018-06-15'),
        pronouns: 'they/them',
        photo: '',
        categories: unifiedCategories,
        themeMode: 'manylla',
        quickInfoPanels: [],
        entries: [
          {
            id: '1',
            category: 'medical',
            title: 'Daily Medications',
            description: 'Melatonin 3mg at bedtime for sleep',
            date: new Date(),
            visibility: ['private'],
          },
          {
            id: '2',
            category: 'sensory',
            title: 'Sensitivities',
            description: 'Avoid fluorescent lights, prefers dim lighting',
            date: new Date(),
            visibility: ['private'],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setProfile(demoProfile);
      await StorageService.saveProfile(demoProfile);
      await AsyncStorage.setItem('manylla_onboarding_completed', 'true');
      setShowOnboarding(false);
    } else if (data.mode === 'fresh') {
      // Create new profile
      if (!data.childName || !data.childName.trim()) {
        console.error('Cannot create profile without child name');
        return;
      }
      
      const newProfile = {
        id: Date.now().toString(),
        name: data.childName.trim(),
        preferredName: data.childName.trim(),
        dateOfBirth: data.dateOfBirth || new Date(),
        pronouns: '',
        photo: data.photo || '',
        categories: unifiedCategories,
        themeMode: 'manylla',
        quickInfoPanels: [],
        entries: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setProfile(newProfile);
      await StorageService.saveProfile(newProfile);
      await AsyncStorage.setItem('manylla_onboarding_completed', 'true');
      setShowOnboarding(false);
    } else if (data.mode === 'join' && data.accessCode) {
      console.log('Join with code:', data.accessCode);
    }
  };

  const handleUpdateProfile = async (updates) => {
    const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);
  };

  // Show loading spinner
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Main app view
  return (
    <ScrollView style={styles.container}>
      <ProfileOverview
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

// Main App wrapper
function App() {
  const [profileForSync, setProfileForSync] = useState(null);

  const handleProfileFromSync = useCallback((syncedProfile) => {
    console.log('[App] Received profile from sync');
    setProfileForSync(syncedProfile);
  }, []);

  // Root wrapper varies by platform
  const RootWrapper = Platform.OS === 'web' ? View : GestureHandlerRootView;

  return (
    <RootWrapper style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SyncProvider onProfileReceived={handleProfileFromSync}>
            {Platform.OS !== 'web' && (
              <StatusBar 
                barStyle="dark-content" 
                backgroundColor="transparent"
                translucent
              />
            )}
            <AppContent />
          </SyncProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </RootWrapper>
  );
}

export default App;