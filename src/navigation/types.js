import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Entry, CategoryConfig } from "../types/ChildProfile";

// Root Stack Navigator
export RootStackParamList = {
  Onboardingndefined;
  MainavigatorScreenParams<MainTabParamList>;
  Authndefined;
};

// Main Tab Navigator
export MainTabParamList = {
  Homendefined;
  Entriesndefined;
  Addndefined;
  Sharendefined;
  Settingsndefined;
};

// Home Stack Navigator
export HomeStackParamList = {
  ProfileOverviewndefined;
  ProfileEdit: { profileId?tring };
  EntryDetail: { entryIdtring };
  CategoryDetail: { categoryIdtring };
};

// Entries Stack Navigator
export EntriesStackParamList = {
  EntriesList: { categoryId?tring };
  EntryDetail: { entryIdtring };
  EntryEdit: { entryId?tring; categoryId?tring };
};

// Settings Stack Navigator
export SettingsStackParamList = {
  SettingsMainndefined;
  Categoriesndefined;
  CategoryEdit: { categoryId?tring };
  Syncndefined;
  Securityndefined;
  Aboutndefined;
};

// Share Stack Navigator
export ShareStackParamList = {
  ShareMainndefined;
  CreateShare: { entries?tring[] };
  ShareQR: { shareIdtring; shareUrltring };
  ShareHistoryndefined;
};

// Screen Props Types
export RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<"Home">
  >;

export EntriesStackScreenProps<T extends keyof EntriesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<EntriesStackParamList, T>,
    MainTabScreenProps<"Entries">
  >;

export SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    MainTabScreenProps<"Settings">
  >;

export ShareStackScreenProps<T extends keyof ShareStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ShareStackParamList, T>,
    MainTabScreenProps<"Share">
  >;

declare global {
  namespace ReactNavigation {
    
  }
}
