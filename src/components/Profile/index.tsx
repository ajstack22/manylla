import { Platform } from 'react-native';

export const CategorySection = Platform.OS === 'web'
  ? require('./CategorySection.tsx').CategorySection
  : require('./CategorySection.native.tsx').CategorySection;

export const ProfileOverview = Platform.OS === 'web'
  ? require('./ProfileOverview.tsx').ProfileOverview
  : require('./ProfileOverview.native').default;