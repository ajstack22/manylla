/**
 * Incremental test - adding components one by one
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test 2: Context imports
import { ThemeProvider } from './src/context/ThemeContext';
import { SyncProvider } from './src/context/SyncContext';

// Test 3: Storage Service
import { StorageService } from './src/services/storage/storageService';

// Test 4: Categories
import { unifiedCategories } from './src/utils/unifiedCategories';

// Test 5: Onboarding Component
import { OnboardingWizard } from './src/components/Onboarding';

// Test 1: Basic imports
console.log('✅ Basic imports successful');
console.log('✅ Context imports successful');
console.log('✅ StorageService import successful');
console.log('✅ unifiedCategories import successful');
console.log('✅ OnboardingWizard import successful');

// Test 6: ProfileOverview - Platform specific
// Using .native.js for iOS
const { ProfileOverview } = require('./src/components/Profile/ProfileOverview.native');
console.log('✅ Native ProfileOverview loaded');

function AppContent() {
  const [testPhase, setTestPhase] = useState(1);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  console.log(`📱 Rendering test phase ${testPhase}`);
  
  // Test AsyncStorage access
  useEffect(() => {
    if (testPhase === 3) {
      console.log('Testing AsyncStorage...');
      AsyncStorage.getItem('test_key').then(() => {
        console.log('✅ AsyncStorage accessible');
      }).catch(e => {
        console.log('❌ AsyncStorage error:', e.message);
      });
    }
  }, [testPhase]);
  
  // Test StorageService
  useEffect(() => {
    if (testPhase === 4) {
      console.log('Testing StorageService...');
      StorageService.getProfile().then((profile) => {
        console.log('✅ StorageService.getProfile succeeded');
        setProfile(profile);
      }).catch(e => {
        console.log('❌ StorageService error:', e.message);
      });
    }
  }, [testPhase]);
  
  // Increment phase every 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (testPhase < 6) {
        setTestPhase(testPhase + 1);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [testPhase]);
  
  // Phase 1: Basic view
  if (testPhase === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Phase 1: Basic Render</Text>
      </View>
    );
  }
  
  // Phase 2: With loading spinner
  if (testPhase === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Phase 2: With Spinner</Text>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }
  
  // Phase 3: Test AsyncStorage
  if (testPhase === 3) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Phase 3: Testing AsyncStorage</Text>
      </View>
    );
  }
  
  // Phase 4: Test StorageService
  if (testPhase === 4) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Phase 4: Testing StorageService</Text>
        <Text style={styles.subtext}>Profile: {profile ? 'Loaded' : 'Not loaded'}</Text>
      </View>
    );
  }
  
  // Phase 5: Test OnboardingWizard render
  if (testPhase === 5) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Phase 5: Testing OnboardingWizard</Text>
        <OnboardingWizard onComplete={(data) => console.log('Onboarding complete:', data)} />
      </View>
    );
  }
  
  // Phase 6: Test ProfileOverview
  if (testPhase === 6) {
    const testProfile = {
      id: '1',
      name: 'Test User',
      preferredName: 'Test',
      categories: unifiedCategories,
      entries: [],
    };
    
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.text}>Phase 6: Testing ProfileOverview</Text>
        <ProfileOverview
          profile={testProfile}
          onUpdateProfile={(updates) => console.log('Profile update:', updates)}
        />
      </ScrollView>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>All phases complete!</Text>
    </View>
  );
}

function App() {
  console.log('🚀 App.test3.js starting...');
  
  return (
    <ThemeProvider>
      <SyncProvider>
        <AppContent />
      </SyncProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 24,
    color: '#8B7355',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
});

export default App;