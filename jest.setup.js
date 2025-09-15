// Jest setup file for mocking React Native components
import '@testing-library/jest-dom';

// Define __DEV__ global for React Native modules
global.__DEV__ = process.env.NODE_ENV === 'development';

// Mock React Native modules
jest.mock('react-native', () => {
  const platform = {
    OS: 'web',
    select: (obj) => obj.web || obj.default,
  };

  return {
    Platform: platform,
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
      currentHeight: 24,
    },
    PixelRatio: {
      get: () => 2,
    },
    Alert: {
      alert: jest.fn(),
    },
    View: 'div',
    Text: 'span',
    Modal: 'div',
    ScrollView: 'div',
    TouchableHighlight: 'button',
    TouchableOpacity: 'button',
    Image: 'img',
    TextInput: 'input',
    Share: {
      share: jest.fn(() => Promise.resolve()),
    },
    Clipboard: {
      setString: jest.fn(() => Promise.resolve()),
      getString: jest.fn(() => Promise.resolve('')),
    },
    StyleSheet: {
      create: (styles) => styles,
      flatten: (styles) => styles,
    },
    // Add other commonly used React Native modules as needed
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock React Native Picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: 'Picker'
}));

// Mock React Native WebView
jest.mock('react-native-webview', () => ({
  WebView: 'div'
}));

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

// TextEncoder/TextDecoder for encryption tests
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock Canvas API for image processing tests
const mockCanvas = {
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 100,
      height: 100,
    })),
    putImageData: jest.fn(),
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    strokeRect: jest.fn(),
  })),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,test_data'),
  toBlob: jest.fn((callback) => {
    callback(new Blob(['test'], { type: 'image/jpeg' }));
  }),
  width: 100,
  height: 100,
};

// Mock HTMLCanvasElement constructor
global.HTMLCanvasElement = jest.fn(() => mockCanvas);

// Mock document.createElement for canvas
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName, options) => {
  if (tagName === 'canvas') {
    return mockCanvas;
  }
  return originalCreateElement(tagName, options);
});

// Mock Image constructor for image loading tests
global.Image = jest.fn(() => ({
  addEventListener: jest.fn((event, callback) => {
    if (event === 'load') {
      setTimeout(() => callback(), 0);
    }
  }),
  removeEventListener: jest.fn(),
  onload: null,
  onerror: null,
  src: '',
  width: 100,
  height: 100,
  naturalWidth: 100,
  naturalHeight: 100,
}));