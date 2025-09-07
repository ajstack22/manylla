// Platform-specific exports
import { Platform } from 'react-native';

// Dynamic export based on platform
// For native, use the wrapper that adapts the interface
export const OnboardingWizard = Platform.OS === 'web' 
  ? require('./OnboardingWizard').default
  : require('./OnboardingWrapper.native').default;