/**
 * Complete stub replacement for react-native-gesture-handler for web builds
 * Provides all necessary exports to prevent webpack resolution errors
 */

import React from 'react';

// Main components that apps typically import
export const GestureHandlerRootView = ({ children, ...props }) => {
  // Return a simple View-like div for web
  return React.createElement('div', { ...props, style: { ...props.style, display: 'flex', flexDirection: 'column', flex: 1 } }, children);
};

// Other commonly used components and utilities
export const PanGestureHandler = ({ children }) => children;
export const TapGestureHandler = ({ children }) => children;
export const LongPressGestureHandler = ({ children }) => children;
export const PinchGestureHandler = ({ children }) => children;
export const RotationGestureHandler = ({ children }) => children;
export const FlingGestureHandler = ({ children }) => children;

// State constants
export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

// Direction constants
export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

// Gesture handler utilities
export const createNativeWrapper = (Component) => Component;
export const attachGestureHandler = () => {};
export const updateGestureHandler = () => {};
export const dropGestureHandler = () => {};

// Reanimated integration stubs
export const gestureHandlerRootHOC = (Component) => Component;

// Web-specific gesture stubs
export const NativeViewGestureHandler = {};
export const nativeGesture = {};

// Export anything else that might be imported
export const utils = {};
export const Gestures = {};
export const GestureDetector = ({ children }) => children;

// Default export
export default {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  State,
  Directions,
  createNativeWrapper,
};