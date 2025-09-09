// Export web versions for web build
// Metro will handle .native resolution for mobile
export { ManyllaThemeProvider as ThemeProvider, useTheme } from './ThemeContext';

// SyncProvider - shared across platforms
export { SyncProvider, useSync } from './SyncContext';