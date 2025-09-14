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

// Mock crypto for encryption services
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn().mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  },
});

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
  })
);

// Mock localStorage for web environment
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock navigator.clipboard - only if not already defined
if (!global.navigator) {
  global.navigator = {};
}
if (!global.navigator.clipboard) {
  global.navigator.clipboard = {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  };
}

// Mock window.location - only if not already mocked
if (typeof window !== 'undefined') {
  if (!window.location || window.location.hostname !== 'localhost') {
    delete window.location;
    window.location = {
      hostname: 'localhost',
      origin: 'http://localhost:3000',
      pathname: '/qual',
      href: 'http://localhost:3000/qual',
      search: '',
      hash: '',
    };
  }
} else {
  global.window = {
    location: {
      hostname: 'localhost',
      origin: 'http://localhost:3000',
      pathname: '/qual',
      href: 'http://localhost:3000/qual',
      search: '',
      hash: '',
    }
  };
}

// MSW setup disabled - using direct fetch mocking in tests instead

// Additional polyfills for testing environment
global.URL = require('url').URL;