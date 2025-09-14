// Jest setup file for mocking React Native components
import '@testing-library/jest-dom';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (obj) => obj.web || obj.default,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 667 }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  StatusBar: {
    setBarStyle: jest.fn(),
    setHidden: jest.fn(),
    setBackgroundColor: jest.fn(),
    setTranslucent: jest.fn(),
  },
  PixelRatio: {
    get: () => 2,
  },
  Alert: {
    alert: jest.fn(),
  },
  // Add other commonly used React Native modules as needed
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');