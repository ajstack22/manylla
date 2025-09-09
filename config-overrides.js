const path = require('path');

module.exports = function override(config, env) {
  // Alias react-native to react-native-web for web builds
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native/Libraries/NewAppScreen': 'react-native-web',
    '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/services/webStorage.js')
  };
  
  // Add .web.js and .web.tsx extensions before default extensions
  config.resolve.extensions = [
    '.web.js',
    '.web.jsx', 
    '.web.ts',
    '.web.tsx',
    ...config.resolve.extensions
  ];
  
  // Disable react-refresh for now to avoid conflicts
  if (env === 'development') {
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'ReactRefreshPlugin'
    );
  }
  
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "assert": false,
    "http": false,
    "https": false,
    "os": false,
    "url": false
  };
  
  return config;
}
