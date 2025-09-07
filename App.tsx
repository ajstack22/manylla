import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './ErrorBoundary';
import { ThemeProvider } from '@context/ThemeContext';
import { ProfileProvider } from '@context/ProfileContext';
import { SyncProvider } from '@context/SyncContext';
import RootNavigator from '@navigation/RootNavigator';

function App(): React.JSX.Element {
  console.log('App component rendering...');
  
  // Full app with all providers and navigation
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ProfileProvider>
              <SyncProvider>
                <StatusBar 
                  barStyle="dark-content" 
                  backgroundColor="transparent"
                  translucent
                />
                <RootNavigator />
              </SyncProvider>
            </ProfileProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default App;