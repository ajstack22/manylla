import { Platform } from 'react-native';

export const Header = Platform.OS === 'web'
  ? require('./Header.tsx').Header
  : require('./Header.native.tsx').Header;