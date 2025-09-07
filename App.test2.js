import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

console.log('App.test2.js: Testing component usage...');

// Test using the contexts
let ThemeProvider, SyncProvider;

try {
  ThemeProvider = require('./src/context/ThemeContext').ThemeProvider;
  console.log('✅ ThemeProvider loaded');
} catch (e) {
  console.error('❌ ThemeProvider failed:', e.message);
  ThemeProvider = ({ children }) => children;
}

try {
  // Try both possible exports
  const SyncModule = require('./src/context/SyncContext');
  SyncProvider = SyncModule.SyncProvider || SyncModule.default?.SyncProvider;
  if (!SyncProvider) {
    console.error('❌ SyncProvider not found in module');
    SyncProvider = ({ children }) => children;
  } else {
    console.log('✅ SyncProvider loaded');
  }
} catch (e) {
  console.error('❌ SyncProvider failed:', e.message);
  SyncProvider = ({ children }) => children;
}

function AppContent() {
  const [count, setCount] = useState(0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test App with Contexts</Text>
      <Text style={styles.subtext}>Platform: {Platform.OS}</Text>
      <Text style={styles.subtext}>Count: {count}</Text>
      <Text onPress={() => setCount(count + 1)} style={styles.button}>
        Tap to increment
      </Text>
    </View>
  );
}

function App() {
  console.log('App.test2.js: Rendering with providers...');
  
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
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#8B7355',
    color: 'white',
    borderRadius: 5,
    overflow: 'hidden',
  },
});

export default App;