// Note: TypeScript imports removed since this is a JavaScript file
// with all TypeScript types commented out

// Root Stack Navigator
export const RootStackParamList = {
  Onboarding: undefined,
  Main: undefined, // NavigatorScreenParams<MainTabParamList>
  Auth: undefined,
};

// Main Tab Navigator
export const MainTabParamList = {
  Home: undefined,
  Entries: undefined,
  Add: undefined,
  Share: undefined,
  Settings: undefined,
};

// Home Stack Navigator
export const HomeStackParamList = {
  ProfileOverview: undefined,
  ProfileEdit: { profileId: undefined }, // string optional
  EntryDetail: { entryId: undefined }, // string required
  CategoryDetail: { categoryId: undefined }, // string required
};

// Entries Stack Navigator
export const EntriesStackParamList = {
  EntriesList: { categoryId: undefined }, // string optional
  EntryDetail: { entryId: undefined }, // string required
  EntryEdit: { entryId: undefined, categoryId: undefined }, // both optional
};

// Settings Stack Navigator
export const SettingsStackParamList = {
  SettingsMain: undefined,
  Categories: undefined,
  CategoryEdit: { categoryId: undefined }, // string optional
  Sync: undefined,
  Security: undefined,
  About: undefined,
};

// Share Stack Navigator
export const ShareStackParamList = {
  ShareMain: undefined,
  CreateShare: { entries: undefined }, // string[] optional
  ShareQR: { shareId: undefined, shareUrl: undefined }, // both string required
  ShareHistory: undefined,
};

// Screen Props Types
// TypeScript type - commented out for JavaScript
// export type RootStackScreenProps<T extends keyof RootStackParamList> =
//   NativeStackScreenProps<RootStackParamList, T>;

// TypeScript type - commented out for JavaScript
// export type MainTabScreenProps<T extends keyof MainTabParamList> =
//   CompositeScreenProps<
//     BottomTabScreenProps<MainTabParamList, T>,
//     RootStackScreenProps<keyof RootStackParamList>
//   >;

// TypeScript type - commented out for JavaScript
// export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
//   CompositeScreenProps<
//     NativeStackScreenProps<HomeStackParamList, T>,
//     MainTabScreenProps<"Home">
//   >;

// TypeScript type - commented out for JavaScript
// export type EntriesStackScreenProps<T extends keyof EntriesStackParamList> =
//   CompositeScreenProps<
//     NativeStackScreenProps<EntriesStackParamList, T>,
//     MainTabScreenProps<"Entries">
//   >;

// TypeScript type - commented out for JavaScript
// export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
//   CompositeScreenProps<
//     NativeStackScreenProps<SettingsStackParamList, T>,
//     MainTabScreenProps<"Settings">
//   >;

// TypeScript type - commented out for JavaScript
// export type ShareStackScreenProps<T extends keyof ShareStackParamList> =
//   CompositeScreenProps<
//     NativeStackScreenProps<ShareStackParamList, T>,
//     MainTabScreenProps<"Share">
//   >;

// TypeScript global declaration - commented out for JavaScript
// declare global {
//   namespace ReactNavigation {
//     interface RootParamList extends RootStackParamList {}
//   }
// }
