import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Entry, CategoryConfig } from '@types/ChildProfile';

// Root Stack Navigator
export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Entries: undefined;
  Add: undefined;
  Share: undefined;
  Settings: undefined;
};

// Home Stack Navigator
export type HomeStackParamList = {
  ProfileOverview: undefined;
  ProfileEdit: { profileId?: string };
  EntryDetail: { entryId: string };
  CategoryDetail: { categoryId: string };
};

// Entries Stack Navigator
export type EntriesStackParamList = {
  EntriesList: { categoryId?: string };
  EntryDetail: { entryId: string };
  EntryEdit: { entryId?: string; categoryId?: string };
};

// Settings Stack Navigator
export type SettingsStackParamList = {
  SettingsMain: undefined;
  Categories: undefined;
  CategoryEdit: { categoryId?: string };
  Sync: undefined;
  Security: undefined;
  About: undefined;
};

// Share Stack Navigator
export type ShareStackParamList = {
  ShareMain: undefined;
  CreateShare: { entries?: string[] };
  ShareQR: { shareId: string; shareUrl: string };
  ShareHistory: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<'Home'>
  >;

export type EntriesStackScreenProps<T extends keyof EntriesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<EntriesStackParamList, T>,
    MainTabScreenProps<'Entries'>
  >;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    MainTabScreenProps<'Settings'>
  >;

export type ShareStackScreenProps<T extends keyof ShareStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ShareStackParamList, T>,
    MainTabScreenProps<'Share'>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}