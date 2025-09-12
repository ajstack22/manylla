import React, { lazy, Suspense } from "react";
import { View, ActivityIndicator } from 'react-native';
import platform from './platform';

// Simple lazy loading wrapper for web
export const lazyLoad = (importFunc) => {
  if (platform.isWeb) {
    const LazyComponent = lazy(importFunc);

    return (props) => (
      <Suspense
        fallback={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#A08670" />
          </View>
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  // For native, just return the component directly
  const Component = importFunc();
  return Component.default || Component;
};
