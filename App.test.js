import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Test imports one by one
console.log('App.test.js: Starting imports...');

// Test 1: Basic Context imports
try {
  const ThemeContext = require('./src/context/ThemeContext');
  console.log('✅ ThemeContext imported');
} catch (e) {
  console.error('❌ ThemeContext failed:', e.message);
}

try {
  const SyncContext = require('./src/context/SyncContext');
  console.log('✅ SyncContext imported');
} catch (e) {
  console.error('❌ SyncContext failed:', e.message);
}

// Test 2: Component imports
try {
  const Onboarding = require('./src/components/Onboarding');
  console.log('✅ Onboarding imported');
} catch (e) {
  console.error('❌ Onboarding failed:', e.message);
}

// Test 3: Service imports
try {
  const StorageService = require('./src/services/storage/storageService');
  console.log('✅ StorageService imported');
} catch (e) {
  console.error('❌ StorageService failed:', e.message);
}

// Test 4: Utils imports
try {
  const unifiedCategories = require('./src/utils/unifiedCategories');
  console.log('✅ unifiedCategories imported');
} catch (e) {
  console.error('❌ unifiedCategories failed:', e.message);
}

function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Debug App - Check Console</Text>
      <Text style={styles.subtext}>Platform: {Platform.OS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4E4C1',
  },
  text: {
    fontSize: 24,
    color: '#8B7355',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    color: '#666',
  },
});

export default App;