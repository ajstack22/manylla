/**
 * Manylla - Cross-Platform App
 * Single codebase following StackMap's architecture pattern
 * Uses React Native components for both iOS and Web
 *
 * DEPLOYMENT: Use ./scripts/deploy-qual.sh ONLY
 * DO NOT use npm run deploy:qual or manual deployment
 * Release notes must be updated before deployment
 */

import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Use cross-platform Icon from IconProvider instead
import Icon from "./src/components/Common/IconProvider";

// Platform utilities
import { isWeb, isAndroid, isMobile } from "./src/utils/platform";
// Shared imports
import { ThemeProvider, SyncProvider, useSync, useTheme } from "./src/context";
import { StorageService } from "./src/services/storage/storageService";
import { unifiedCategories } from "./src/utils/unifiedCategories";

// Import unified components
import {
  EntryForm,
  ProfileEditForm,
} from "./src/components/UnifiedApp";

// Import additional components
import { ThemedToast } from "./src/components/Toast";
import { LoadingOverlay } from "./src/components/Loading";
import { Header, HEADER_HEIGHT } from "./src/components/Layout";
import SettingsMenu from "./src/components/Navigation/SettingsMenu";
import { ShareAccessView } from "./src/components/Sharing";
import PrivacyModal from "./src/components/Modals/PrivacyModal";
import SupportModal from "./src/components/Modals/SupportModal";
// Lazy load onboarding - only shown to new users
const OnboardingScreen = lazy(
  () => import("./src/screens/Onboarding/OnboardingScreen"),
);
// Lazy load heavy sharing components
const PrintPreview = lazy(() =>
  import("./src/components/Sharing").then((module) => ({
    default: module.PrintPreview,
  })),
);
const QRCodeModal = lazy(() =>
  import("./src/components/Sharing").then((module) => ({
    default: module.QRCodeModal,
  })),
);

// Import Share and Sync dialogs - lazy loaded for better performance
const ShareDialog = lazy(() =>
  import("./src/components/Sharing").then((module) => ({
    default: module.ShareDialog,
  })),
);
const SyncDialog = lazy(() =>
  import("./src/components/Sync").then((module) => ({
    default: module.SyncDialog,
  })),
);

// Icon imports - must be after other imports due to conditional requires
let EditIcon, DeleteIcon;
if (isWeb()) {
  // Use Material-UI icons for web
  const MuiIcons = require("@mui/icons-material");
  EditIcon = MuiIcons.Edit;
  DeleteIcon = MuiIcons.Delete;
} else {
  // Use React Native Vector Icons for mobile
  const Icon = require("react-native-vector-icons/MaterialIcons").default;
  EditIcon = (props) => (
    <Icon name="edit" size={20} color={props.color || "#666"} />
  );
  DeleteIcon = (props) => (
    <Icon name="delete" size={20} color={props.color || "#666"} />
  );
}

// Platform-specific imports
let GestureHandlerRootView = View; // Default to View
let SafeAreaProvider = ({ children }) => children; // Default passthrough

if (isMobile()) {
  // Mobile-only imports
  try {
    const GestureHandler = require("react-native-gesture-handler");
    GestureHandlerRootView = GestureHandler.GestureHandlerRootView || View;
  } catch (e) {
    console.log("Gesture handler not available");
  }

  try {
    const SafeArea = require("react-native-safe-area-context");
    SafeAreaProvider =
      SafeArea.SafeAreaProvider || (({ children }) => children);
  } catch (e) {
    console.log("Safe area not available");
  }
}

// Debug check for undefined components
if (typeof EntryForm === "undefined") console.error("EntryForm is undefined");
if (typeof ProfileEditForm === "undefined")
  console.error("ProfileEditForm is undefined");

// Web-specific early sync data capture (from StackMap pattern)
if (isWeb() && typeof window !== "undefined" && window.location) {
  // Check for share URL pattern
  const pathname = window.location.pathname;
  const shareMatch = pathname.match(/\/share\/([a-zA-Z0-9-]+)/);

  if (shareMatch && window.__initialHash) {
    window.shareDataImmediate = {
      shareId: shareMatch[1],
      encryptionKey: window.__initialHash.substring(1),
    };
    console.log("[App] Captured share data:", { shareId: shareMatch[1] });
  }

  // Early URL parameter capture for privacy modal
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('privacy')) {
    window.urlOpenPrivacy = true;
    console.log("[App] Privacy parameter detected");
  }
  
  // Early URL parameter capture for support modal
  if (urlParams.has('support')) {
    window.urlOpenSupport = true;
    console.log("[App] Support parameter detected");
  }
}

// Note: Default colors removed - now managed by ThemeContext

// Helper function to get icon for category
const getCategoryIcon = (categoryTitle) => {
  // Always return Label icon for all categories
  return "Label";
};

// Profile Overview Component
const ProfileOverview = ({
  profile,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onUpdateProfile,
  onShare,
  onEditProfile,
  onManageCategories,
  onOpenSettings,
  styles,
  colors,
  onScrollChange,
}) => {
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width,
  );

  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(Dimensions.get("window").width);
    };

    const subscription = Dimensions.addEventListener("change", updateWidth);
    return () => subscription?.remove();
  }, []);

  // Add scroll listener for web with throttling
  useEffect(() => {
    if (isWeb() && onScrollChange) {
      let ticking = false;
      let lastKnownScrollY = 0;

      const handleWebScroll = () => {
        lastKnownScrollY =
          window.scrollY ||
          window.pageYOffset ||
          document.documentElement.scrollTop;

        if (!ticking) {
          requestAnimationFrame(() => {
            const shouldHideProfile = lastKnownScrollY > 150;
            onScrollChange(shouldHideProfile);
            ticking = false;
          });
          ticking = true;
        }
      };

      // Check initial scroll position
      const initialScrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;
      onScrollChange(initialScrollY > 150);

      window.addEventListener("scroll", handleWebScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleWebScroll);
    }
  }, [onScrollChange]);

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profile loaded</Text>
      </View>
    );
  }

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getEntriesByCategory = (categoryName) => {
    return profile.entries.filter((entry) => entry.category === categoryName);
  };

  const handleMoveCategory = (categoryId, direction) => {
    if (!onUpdateProfile) return;

    const categories = [...profile.categories];
    const index = categories.findIndex(cat => cat.id === categoryId);

    // Skip if Quick Info (always index 0)
    if (categoryId === 'quick-info') return;

    if (direction === 'up' && index > 1) { // > 1 because Quick Info is 0
      [categories[index], categories[index - 1]] =
        [categories[index - 1], categories[index]];
    } else if (direction === 'down' && index < categories.length - 1) {
      [categories[index], categories[index + 1]] =
        [categories[index + 1], categories[index]];
    }

    // Update order property
    categories.forEach((cat, idx) => {
      cat.order = idx;
    });

    // Save updated profile
    const updatedProfile = {
      ...profile,
      categories,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProfile(updatedProfile);
  };

  // Separate QuickInfo panels from regular categories
  const quickInfoCategories = profile.categories
    .filter((cat) => cat.isQuickInfo)
    .sort((a, b) => a.order - b.order);

  const regularCategories = profile.categories
    .filter(
      (cat) =>
        !cat.isQuickInfo &&
        getEntriesByCategory(cat.name).length > 0,
    )
    .sort((a, b) => a.order - b.order);

  const visibleCategories = [...quickInfoCategories, ...regularCategories];

  const isDesktop = windowWidth > 1024;

  // Track scroll position for header profile display
  const handleScroll = (event) => {
    if (isWeb() && onScrollChange) {
      // For React Native Web, contentOffset might not work properly
      const scrollY =
        event.nativeEvent.contentOffset?.y ||
        event.nativeEvent.scrollTop ||
        event.currentTarget.scrollTop ||
        0;
      // Profile photo is about 120px + padding, hide when scrolled past ~150px
      const shouldHideProfile = scrollY > 150;
      console.log("Scroll detected:", { scrollY, shouldHideProfile });
      onScrollChange(shouldHideProfile);
    }
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ScrollView
        style={styles.profileContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          {/* Desktop: Side-by-side layout, Mobile: Stacked layout */}
          <View style={isDesktop ? styles.desktopHeader : null}>
            {/* Profile Header Card */}
            <View
              style={[
                styles.profileCard,
                isDesktop && styles.profileCardDesktop,
              ]}
            >
              <TouchableOpacity
                onPress={() => onEditProfile && onEditProfile()}
              >
                <View style={styles.avatarContainer}>
                  {profile.photo && profile.photo !== "default" ? (
                    <Image
                      source={
                        profile.photo === '__DEMO_ELLIE__'
                          ? require('./public/assets/ellie.png')
                          : { uri: profile.photo }
                      }
                      style={styles.avatar}
                      onLoad={() => console.log('[PHOTO-TEST] ✓ ProfileOverview photo loaded successfully')}
                      onError={(e) => console.error('[PHOTO-TEST] ✗ ProfileOverview photo failed:', JSON.stringify(e.nativeEvent))}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                        {profile.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.profileName}>
                {profile.preferredName || profile.name}
              </Text>
              <Text style={styles.profileAge}>
                Age: {calculateAge(profile.dateOfBirth)} years
              </Text>
            </View>

            {/* Quick Info - Beside profile on desktop, below on mobile */}
            {(() => {
              const quickInfoEntries = getEntriesByCategory("quick-info");
              // Show Quick Info if it has entries or if it's visible in categories
              const quickInfoCategory = visibleCategories.find(
                (cat) => cat.name === "quick-info",
              );
              if (quickInfoCategory || quickInfoEntries.length > 0) {
                return (
                  <View
                    style={
                      isDesktop
                        ? styles.quickInfoDesktop
                        : [styles.categorySection, styles.quickInfoSection]
                    }
                  >
                    <View style={styles.categoryHeader}>
                      <Icon
                        name={getCategoryIcon("quick-info")}
                        size={20}
                        color={quickInfoCategory?.color || "#9B59B6"}
                        style={{ marginRight: 8, opacity: 0.8 }}
                      />
                      <Text style={styles.categoryTitle}>Quick Info</Text>
                    </View>
                    <View
                      style={[
                        styles.categoryContent,
                        isDesktop && styles.quickInfoContentDesktop,
                      ]}
                    >
                      {quickInfoEntries.length === 0 ? (
                        <Text style={styles.emptyCategory}>
                          No quick info yet
                        </Text>
                      ) : (
                        quickInfoEntries.map((entry, index) => (
                          <View
                            key={entry.id}
                            style={[
                              styles.entryItem,
                              index === 0 && { marginTop: 0 },
                            ]}
                          >
                            <View style={styles.entryHeader}>
                              <Text style={styles.entryTitle}>
                                {entry.title}
                              </Text>
                              <View style={styles.entryActions}>
                                <TouchableOpacity
                                  onPress={() => onEditEntry(entry)}
                                  style={styles.iconButton}
                                  accessibilityLabel={`Edit ${entry.title}`}
                                  accessibilityRole="button"
                                >
                                  {isWeb() ? (
                                    <EditIcon
                                      sx={{ fontSize: 20, color: "#666" }}
                                    />
                                  ) : (
                                    <EditIcon />
                                  )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => {
                                    if (isWeb()) {
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete this entry?",
                                        )
                                      ) {
                                        onDeleteEntry(entry.id);
                                      }
                                    } else {
                                      Alert.alert(
                                        "Delete Entry",
                                        "Are you sure you want to delete this entry?",
                                        [
                                          { text: "Cancel", style: "cancel" },
                                          {
                                            text: "Delete",
                                            style: "destructive",
                                            onPress: () =>
                                              onDeleteEntry(entry.id),
                                          },
                                        ],
                                      );
                                    }
                                  }}
                                  style={styles.iconButton}
                                  accessibilityLabel={`Delete ${entry.title}`}
                                  accessibilityRole="button"
                                >
                                  {isWeb() ? (
                                    <DeleteIcon
                                      sx={{
                                        fontSize: 20,
                                        color: "#666",
                                        "&:hover": { color: "#d32f2f" },
                                      }}
                                    />
                                  ) : (
                                    <DeleteIcon />
                                  )}
                                </TouchableOpacity>
                              </View>
                            </View>
                            {entry.description && (
                              <Text
                                style={styles.entryDescription}
                                numberOfLines={2}
                              >
                                {entry.description.replace(/<[^>]*>/g, "")}
                              </Text>
                            )}
                            <Text style={styles.entryDate}>
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(
                                new Date(entry.updatedAt || entry.date),
                              )}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                );
              }
              return null;
            })()}
          </View>

          {/* Categories Grid */}
          <View style={styles.categoriesContainer}>
            <View style={styles.categoriesGrid}>
              {visibleCategories
                .filter((cat) => cat.name !== "quick-info")
                .map((category, index, filteredCategories) => {
                  const entries = getEntriesByCategory(category.name);
                  const isFirst = index === 0;
                  const isLast = index === filteredCategories.length - 1;

                  // Dynamic column width based on current window width
                  const categoryStyle = [
                    styles.categorySection,
                    windowWidth > 768 &&
                      isWeb() && {
                        width: "calc(50% - 12px)",
                        marginHorizontal: 6,
                      },
                  ];

                  return (
                    <View key={category.id} style={categoryStyle}>
                      <View style={styles.categoryHeader}>
                        <Icon
                          name={getCategoryIcon(category.displayName)}
                          size={20}
                          color={category.color}
                          style={{ marginRight: 8, opacity: 0.8 }}
                        />
                        <Text style={[styles.categoryTitle, { flex: 1 }]}>
                          {category.displayName}
                        </Text>
                        {/* Add reorder controls */}
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          <TouchableOpacity
                            style={{
                              padding: 4,
                              opacity: isFirst ? 0.2 : 0.6,
                            }}
                            onPress={() => handleMoveCategory(category.id, 'up')}
                            disabled={isFirst}
                            accessibilityLabel={`Move ${category.displayName} up`}
                          >
                            <Text style={{ fontSize: 20, color: colors.text?.secondary || "#666" }}>↑</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              padding: 4,
                              opacity: isLast ? 0.2 : 0.6,
                            }}
                            onPress={() => handleMoveCategory(category.id, 'down')}
                            disabled={isLast}
                            accessibilityLabel={`Move ${category.displayName} down`}
                          >
                            <Text style={{ fontSize: 20, color: colors.text?.secondary || "#666" }}>↓</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.categoryContent}>
                        {entries.length === 0 ? (
                          <Text style={styles.emptyCategory}>
                            No entries yet
                          </Text>
                        ) : (
                          entries.map((entry, index) => (
                            <View
                              key={entry.id}
                              style={[
                                styles.entryItem,
                                index === 0 && { marginTop: 0 },
                              ]}
                            >
                              <View style={styles.entryHeader}>
                                <Text style={styles.entryTitle}>
                                  {entry.title}
                                </Text>
                                <View style={styles.entryActions}>
                                  <TouchableOpacity
                                    onPress={() => onEditEntry(entry)}
                                    style={styles.iconButton}
                                    accessibilityLabel={`Edit ${entry.title}`}
                                    accessibilityRole="button"
                                  >
                                    {isWeb() ? (
                                      <EditIcon
                                        sx={{ fontSize: 20, color: "#666" }}
                                      />
                                    ) : (
                                      <EditIcon />
                                    )}
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      if (isWeb()) {
                                        if (
                                          window.confirm(
                                            "Are you sure you want to delete this entry?",
                                          )
                                        ) {
                                          onDeleteEntry(entry.id);
                                        }
                                      } else {
                                        Alert.alert(
                                          "Delete Entry",
                                          "Are you sure you want to delete this entry?",
                                          [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                              text: "Delete",
                                              style: "destructive",
                                              onPress: () =>
                                                onDeleteEntry(entry.id),
                                            },
                                          ],
                                        );
                                      }
                                    }}
                                    style={styles.iconButton}
                                    accessibilityLabel={`Delete ${entry.title}`}
                                    accessibilityRole="button"
                                  >
                                    {isWeb() ? (
                                      <DeleteIcon
                                        sx={{
                                          fontSize: 20,
                                          color: "#666",
                                          "&:hover": { color: "#d32f2f" },
                                        }}
                                      />
                                    ) : (
                                      <DeleteIcon />
                                    )}
                                  </TouchableOpacity>
                                </View>
                              </View>
                              {entry.description && (
                                <Text
                                  style={styles.entryDescription}
                                  numberOfLines={2}
                                >
                                  {entry.description.replace(/<[^>]*>/g, "")}
                                </Text>
                              )}
                              <Text style={styles.entryDate}>
                                {new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }).format(
                                  new Date(entry.updatedAt || entry.date),
                                )}
                              </Text>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons - Dual FAB System */}
      {/* Left FAB: Add Entry */}
      <TouchableOpacity
        style={styles.fabLeft}
        onPress={() => onAddEntry("")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabTextLeft}>+</Text>
      </TouchableOpacity>

      {/* Right FAB: Settings Menu */}
      <TouchableOpacity
        style={styles.fabRight}
        onPress={onOpenSettings}
        activeOpacity={0.8}
      >
        <Text style={styles.fabTextRight}>⋮</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main App content
function AppContent() {
  const { pushSync, syncStatus } = useSync();
  const { colors, theme, toggleTheme, setThemeMode } = useTheme();

  // Create styles based on current theme colors
  const styles = createStyles(colors, theme);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [qrCodeOpen, setQRCodeOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [operationLoading, setOperationLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // Share view state
  const [isShareView, setIsShareView] = useState(false);
  
  // Privacy modal state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  // Support modal state
  const [showSupportModal, setShowSupportModal] = useState(false);
  // Settings menu state
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [shareAccessCode, setShareAccessCode] = useState(null);
  const [shareEncryptionKey, setShareEncryptionKey] = useState(null);

  // Configure StatusBar for Android
  useEffect(() => {
    if (isAndroid()) {
      StatusBar.setBackgroundColor("transparent");
      StatusBar.setTranslucent(true);
      StatusBar.setBarStyle(
        theme === "dark" ? "light-content" : "dark-content",
      );
    }
  }, [theme]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Check for share URL first (web only)
        if (isWeb() && typeof window !== "undefined" && window.location) {
          const pathname = window.location.pathname;
          const hash = window.location.hash;
          const shareMatch = pathname.match(/\/share\/([A-Z0-9]{4}-[A-Z0-9]{4})/i);
          
          if (shareMatch && hash && hash.length > 1) {
            // This is a share URL - show share view instead of normal app
            setShareAccessCode(shareMatch[1]);
            setShareEncryptionKey(hash.substring(1));
            setIsShareView(true);
            setShowOnboarding(false);
            setIsLoading(false);
            return;
          }
        }
        
        // Normal app flow - check if onboarding completed
        const onboardingCompleted =
          (await AsyncStorage.getItem("manylla_onboarding_completed")) ===
          "true";
        const storedProfile = await StorageService.getProfile();

        if (onboardingCompleted && storedProfile && storedProfile.name) {
          // Migrate categories to ensure isVisible property exists
          const migratedProfile = {
            ...storedProfile,
            categories: storedProfile.categories?.map(cat => ({
              ...cat,
              isVisible: cat.isVisible !== undefined ? cat.isVisible : true,
            })) || unifiedCategories,
          };

          // Preserve the stored profile with its entries and categories
          setProfile(migratedProfile);

          // Save the migration if needed
          if (JSON.stringify(storedProfile.categories) !== JSON.stringify(migratedProfile.categories)) {
            await StorageService.saveProfile(migratedProfile);
          }

          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
          // Clear invalid data
          if (!storedProfile?.name) {
            await StorageService.clearProfile();
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Delayed execution for privacy modal URL parameter (after hydration)
  useEffect(() => {
    if (!isLoading && isWeb() && typeof window !== "undefined") {
      // Wait 1 second for full hydration
      const timer = setTimeout(() => {
        if (window.urlOpenPrivacy) {
          setShowPrivacyModal(true);
          window.urlOpenPrivacy = false;
          console.log("[App] Opening privacy modal from URL parameter");
        }
        if (window.urlOpenSupport) {
          setShowSupportModal(true);
          window.urlOpenSupport = false;
          console.log("[App] Opening support modal from URL parameter");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Update document title on web
  useEffect(() => {
    if (isWeb() && profile && typeof document !== "undefined") {
      document.title = `manylla - ${profile.preferredName || profile.name}`;
    }
  }, [profile]);

  // Push profile changes to sync
  useEffect(() => {
    if (profile && !isLoading && pushSync) {
      // Only push if we have a sync function available
      pushSync(profile).catch((error) => {
        console.log("Sync not configured yet:", error.message);
      });
    }
  }, [profile, isLoading, pushSync]);

  // Toast notification helper
  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  // Loading helper
  const withLoading = async (message, operation) => {
    setOperationLoading(true);
    setLoadingMessage(message);
    try {
      const result = await operation();
      setOperationLoading(false);
      return result;
    } catch (error) {
      setOperationLoading(false);
      showToast("Operation failed", "error");
      throw error;
    }
  };

  const handleOnboardingComplete = async (data) => {
    if (data.mode === "demo") {
      // Create demo profile with Ellie Thompson data
      const demoProfile = {
        id: "demo-" + Date.now(),
        name: "Ellie Thompson",
        preferredName: "Ellie",
        pronouns: "she/her",
        dateOfBirth: new Date("2018-06-15"),
        photo: '__DEMO_ELLIE__',
        categories: unifiedCategories.map((cat) => ({
          ...cat,
          icon:
            cat.id === "quick-info"
              ? "info"
              : cat.id === "daily-support"
                ? "support"
                : cat.id === "health-therapy"
                  ? "health"
                  : cat.id === "education-goals"
                    ? "education"
                    : cat.id === "behavior-social"
                      ? "social"
                      : cat.id === "family-resources"
                        ? "family"
                        : "folder",
        })),
        entries: [
          // Quick Info entries
          {
            id: "1",
            category: "quick-info",
            title: "Communication",
            description:
              "Non-verbal when overwhelmed - uses AAC device with picture cards",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "2",
            category: "quick-info",
            title: "Emergency Contact",
            description: "Mom (Emily) - 555-0123",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "3",
            category: "quick-info",
            title: "Medical Alert",
            description: "Allergic to peanuts - carries EpiPen",
            date: new Date(),
            visibility: ["private"],
          },
          // Daily Support entries
          {
            id: "4",
            category: "daily-support",
            title: "Sensory Needs",
            description:
              "Calms down with deep pressure, sensitive to loud noises",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "5",
            category: "daily-support",
            title: "Daily Routine",
            description:
              "Loves trains and dinosaurs, needs structure for transitions",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "6",
            category: "daily-support",
            title: "Comfort Items",
            description:
              "Blue weighted blanket and dinosaur stuffed animal help with anxiety",
            date: new Date(),
            visibility: ["private"],
          },
          // Health & Therapy entries
          {
            id: "7",
            category: "health-therapy",
            title: "Medications",
            description: "Melatonin 3mg at bedtime for sleep",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "8",
            category: "health-therapy",
            title: "Therapy Schedule",
            description: "Speech therapy Tuesdays, OT Thursdays at 3pm",
            date: new Date(),
            visibility: ["private"],
          },
          // Education & Goals entries
          {
            id: "9",
            category: "education-goals",
            title: "IEP Goals",
            description:
              "Working on 2-word phrases and following 2-step directions",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "10",
            category: "education-goals",
            title: "Learning Style",
            description:
              "Visual learner - responds well to picture cards and demonstrations",
            date: new Date(),
            visibility: ["private"],
          },
          // Behavior & Social entries
          {
            id: "11",
            category: "behavior-social",
            title: "Triggers",
            description:
              "Loud unexpected noises, changes in routine without warning",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "12",
            category: "behavior-social",
            title: "Social Preferences",
            description: "Prefers parallel play, working on turn-taking skills",
            date: new Date(),
            visibility: ["private"],
          },
          // Family & Resources entries
          {
            id: "13",
            category: "family-resources",
            title: "Support Team",
            description:
              "Dr. Martinez (pediatrician), Ms. Johnson (special ed teacher)",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "14",
            category: "family-resources",
            title: "Helpful Resources",
            description:
              "Local autism support group meets first Saturday of each month",
            date: new Date(),
            visibility: ["private"],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('[PHOTO-TEST] Demo profile photo value:', demoProfile.photo, 'Type:', typeof demoProfile.photo);

      await StorageService.saveProfile(demoProfile);
      await AsyncStorage.setItem("manylla_onboarding_completed", "true");
      setProfile(demoProfile);
      setShowOnboarding(false);
      showToast("Demo profile created successfully");
      return;
    }

    // Handle other onboarding modes
    if (false) {
      // Old code kept for reference
      // Create demo profile - Ellie's comprehensive example data
      const demoProfile = {
        id: "1",
        name: "Ellie",
        preferredName: "Ellie",
        dateOfBirth: new Date("2018-06-15"),
        pronouns: "she/her",
        photo: "",
        categories: unifiedCategories,
        themeMode: "manylla",
        quickInfoPanels: [],
        entries: [
          // Quick Info entries
          {
            id: "qi-demo-1",
            category: "quick-info",
            title: "Communication",
            description:
              "Uses 2-3 word phrases. Understands more than she can express. Working with speech therapist weekly.",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "qi-demo-2",
            category: "quick-info",
            title: "Sensory",
            description:
              "Sensitive to loud/sudden noises. Loves soft textures and weighted blankets. Prefers dim lighting.",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "qi-demo-3",
            category: "quick-info",
            title: "Medical",
            description:
              "Allergies: Peanuts (EpiPen required). Medications: Melatonin 3mg at bedtime.",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "qi-demo-4",
            category: "quick-info",
            title: "Emergency Contacts",
            description:
              "Mom: Sarah (555) 123-4567\nDad: Mike (555) 123-4568\nDr. Emily Chen: (555) 555-1234",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "qi-demo-5",
            category: "quick-info",
            title: "Calming Strategies",
            description:
              "Deep pressure hugs, quiet corner with books, classical music, fidget toys.",
            date: new Date(),
            visibility: ["private"],
          },
          // Development
          {
            id: "1",
            category: "development",
            title: "Improve Communication Skills",
            description:
              'Working on using full sentences instead of single words. Practice asking for help with "Can you help me?" instead of just "help".',
            date: new Date("2024-01-15"),
            visibility: ["family", "medical", "education"],
          },
          // Development
          {
            id: "2",
            category: "development",
            title: "First Full Day at School",
            description:
              "Ellie completed her first full day at school without needing to come home early! She participated in circle time and even raised her hand once.",
            date: new Date("2024-01-10"),
            visibility: ["family"],
          },
          // Development
          {
            id: "3",
            category: "development",
            title: "Visual Learning",
            description:
              "Ellie learns best with visual aids. Picture cards, visual schedules, and demonstrations work much better than verbal instructions alone.",
            date: new Date("2024-01-08"),
            visibility: ["education"],
          },
          // Daily Support
          {
            id: "4",
            category: "daily-support",
            title: "Loud Noises",
            description:
              "Sudden loud noises (fire alarms, hand dryers) cause significant distress. Always warn beforehand when possible. Noise-canceling headphones help.",
            date: new Date("2024-01-05"),
            visibility: ["family", "medical", "education"],
          },
          // Medical
          {
            id: "5",
            category: "medical",
            title: "Autism Diagnosis",
            description:
              "Diagnosed with Autism Spectrum Disorder at age 3. Evaluation done by Dr. Smith at Children's Hospital.",
            date: new Date("2021-08-20"),
            visibility: ["medical"],
          },
          // Daily Support
          {
            id: "6",
            category: "daily-support",
            title: "Transition Warnings",
            description:
              'Give 5 and 2 minute warnings before transitions. Use visual timer. "In 5 minutes, we\'ll clean up and get ready for lunch."',
            date: new Date("2024-01-12"),
            visibility: ["family", "medical", "education"],
          },
          // Health
          {
            id: "7",
            category: "health",
            title: "Sleep Routine",
            description:
              "Bedtime at 8pm with melatonin. Needs weighted blanket and white noise machine.",
            date: new Date("2024-01-11"),
            visibility: ["family", "medical"],
          },
          // Other
          {
            id: "8",
            category: "other",
            title: "Favorite Activities",
            description:
              "Loves puzzles, building blocks, and water play. Great for reward time.",
            date: new Date("2024-01-09"),
            visibility: ["family"],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log("Demo profile created:", demoProfile);
      console.log("Number of entries:", demoProfile.entries.length);
      await StorageService.saveProfile(demoProfile);
      await AsyncStorage.setItem("manylla_onboarding_completed", "true");
      setProfile(demoProfile);
      setShowOnboarding(false);
    } else if (data.mode === "fresh" && data.childName) {
      // Create new profile
      const newProfile = {
        id: Date.now().toString(),
        name: data.childName.trim(),
        preferredName: data.childName.trim(),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
        pronouns: "",
        photo: data.photo || "",
        categories: unifiedCategories,
        themeMode: "manylla",
        quickInfoPanels: [],
        entries: [
          // Quick Info entries
          {
            id: "qi-1",
            category: "quick-info",
            title: "Communication",
            description:
              "Uses 2-3 word phrases. Understands more than she can express.",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "qi-2",
            category: "quick-info",
            title: "Sensory",
            description:
              "Sensitive to loud noises and bright lights. Loves soft textures.",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "qi-3",
            category: "quick-info",
            title: "Medical",
            description:
              "No allergies. Takes melatonin for sleep (prescribed).",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "qi-4",
            category: "quick-info",
            title: "Dietary",
            description: "Gluten-free diet. Prefers crunchy foods. No nuts.",
            date: new Date(),
            visibility: ["private"],
          },
          {
            id: "qi-5",
            category: "quick-info",
            title: "Emergency Contacts",
            description: "Mom: 555-0123, Dad: 555-0124. Dr. Smith: 555-0199",
            date: new Date(),
            visibility: ["private"],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.saveProfile(newProfile);
      await AsyncStorage.setItem("manylla_onboarding_completed", "true");
      setProfile(newProfile);
      setShowOnboarding(false);
    } else if (data.mode === "join" && data.accessCode) {
      // Join with access code (sync)
      // TODO: Implement sync join
      console.log("Join with code:", data.accessCode);
    }
  };

  const handleUpdateProfile = async (updates) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date(),
    };

    await StorageService.saveProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  const handleAddEntry = (category) => {
    setSelectedCategory(category);
    setEditingEntry(null);
    setEntryFormOpen(true);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setSelectedCategory(entry.category);
    setEntryFormOpen(true);
  };

  const handleSaveEntry = async (entry) => {
    await withLoading("Saving entry...", async () => {
      const newEntry = {
        ...entry,
        id: editingEntry?.id || Date.now().toString(),
        date: new Date(),
      };

      let updatedEntries;
      if (editingEntry) {
        // Update existing entry
        updatedEntries = profile.entries.map((e) =>
          e.id === editingEntry.id ? newEntry : e,
        );
      } else {
        // Add new entry
        updatedEntries = [...(profile.entries || []), newEntry];
      }

      const updatedProfile = {
        ...profile,
        entries: updatedEntries,
        updatedAt: new Date(),
      };

      setProfile(updatedProfile);
      await StorageService.saveProfile(updatedProfile);
      setEntryFormOpen(false);
      setEditingEntry(null);
      setSelectedCategory("");
      showToast(
        editingEntry
          ? "Entry updated successfully"
          : "Entry added successfully",
      );
    });
  };

  const handleDeleteEntry = async (entryId) => {
    if (!profile) return;

    await withLoading("Deleting entry...", async () => {
      const updatedProfile = {
        ...profile,
        entries: profile.entries.filter((e) => e.id !== entryId),
        updatedAt: new Date(),
      };

      await StorageService.saveProfile(updatedProfile);
      setProfile(updatedProfile);
      showToast("Entry deleted successfully");
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("manylla_onboarding_completed");
    setProfile(null);
    setShowOnboarding(true);
  };

  // Show loading spinner
  if (isLoading) {
    return <LoadingOverlay visible={true} message="Loading your profile..." />;
  }
  
  // Show share view if accessing a share URL
  if (isShareView && shareAccessCode && shareEncryptionKey) {
    return (
      <ShareAccessView 
        accessCode={shareAccessCode}
        encryptionKey={shareEncryptionKey}
      />
    );
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <>
        <Suspense fallback={<LoadingOverlay message="Loading..." />}>
          <OnboardingScreen 
            onComplete={handleOnboardingComplete}
            onShowPrivacy={() => setShowPrivacyModal(true)}
          />
        </Suspense>
        
        {/* Privacy Modal available during onboarding - use manylla theme */}
        <PrivacyModal 
          visible={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          forceManyllaTheme={true}
        />
      </>
    );
  }

  // Main app view
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <Header
          colors={colors}
          theme={theme}
          profile={profile}
          onEditProfile={() => setProfileEditOpen(true)}
        />
        <ProfileOverview
          profile={profile}
          onAddEntry={handleAddEntry}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          onUpdateProfile={handleUpdateProfile}
          onShare={() => setShareDialogOpen(true)}
          onEditProfile={() => setProfileEditOpen(true)}
          onOpenSettings={() => setSettingsMenuOpen(true)}
          styles={styles}
          colors={colors}
        />

      {/* Entry Form Modal */}
      <EntryForm
        visible={entryFormOpen}
        onClose={() => {
          setEntryFormOpen(false);
          setEditingEntry(null);
          setSelectedCategory("");
        }}
        onSave={handleSaveEntry}
        category={selectedCategory}
        entry={editingEntry}
        categories={unifiedCategories.filter((cat) => cat.isVisible)}
        themeColors={colors}
      />

      {/* Profile Edit Modal */}
      <ProfileEditForm
        visible={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        onSave={handleUpdateProfile}
        profile={profile}
        themeColors={colors}
      />

      {/* Share Dialog */}
      {shareDialogOpen && (
        <Suspense fallback={<LoadingOverlay message="Loading..." />}>
          <ShareDialog
            open={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            profile={profile}
            onShareLinkGenerated={setShareLink}
            onShowQR={() => {
              setShareDialogOpen(false);
              setQRCodeOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* Sync Dialog */}
      {syncDialogOpen && (
        <Suspense fallback={<LoadingOverlay message="Loading..." />}>
          <SyncDialog
            open={syncDialogOpen}
            onClose={() => setSyncDialogOpen(false)}
            profile={profile}
          />
        </Suspense>
      )}

      {/* Print Preview */}
      {printPreviewOpen && (
        <Suspense fallback={<LoadingOverlay message="Loading..." />}>
          <PrintPreview
            visible={printPreviewOpen}
            onClose={() => setPrintPreviewOpen(false)}
            profile={profile}
            categories={unifiedCategories}
            entries={profile?.entries || []}
          />
        </Suspense>
      )}

      {/* QR Code Modal */}
      {qrCodeOpen && (
        <Suspense fallback={<LoadingOverlay message="Loading..." />}>
          <QRCodeModal
            visible={qrCodeOpen}
            onClose={() => setQRCodeOpen(false)}
            data={shareLink || ""}
            title="Scan to View Profile"
          />
        </Suspense>
      )}

      {/* Toast Notification */}
      <ThemedToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      {/* Operation Loading Overlay */}
      {operationLoading && (
        <LoadingOverlay visible={operationLoading} message={loadingMessage} />
      )}
      
      {/* Privacy Modal - use current theme */}
      <PrivacyModal 
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        forceManyllaTheme={false}
      />

      {/* Support Modal - use manylla theme for branding */}
      <SupportModal 
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        forceManyllaTheme={true}
      />
      
      {/* Settings Menu */}
      <SettingsMenu
        visible={settingsMenuOpen}
        onClose={() => setSettingsMenuOpen(false)}
        onShare={() => setShareDialogOpen(true)}
        onPrintClick={() => setPrintPreviewOpen(true)}
        onSyncClick={() => setSyncDialogOpen(true)}
        onThemeSelect={setThemeMode}
        onPrivacyClick={() => setShowPrivacyModal(true)}
        onSupportClick={() => setShowSupportModal(true)}
        onCloseProfile={handleLogout}
        theme={theme}
        colors={colors}
        syncStatus={syncStatus}
        showToast={showToast}
      />
      </View>
    </SafeAreaView>
  );
}

// Create styles function that accepts colors
const createStyles = (colors, theme) => {
  // Base text style with Atkinson Hyperlegible font
  const baseTextStyle = isWeb()
    ? {
        fontFamily:
          '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      }
    : {};

  return StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.background.paper,
      ...baseTextStyle,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
      // Add padding for fixed header on web
      ...Platform.select({
        web: {
          paddingTop: HEADER_HEIGHT,
        },
        default: {},
      }),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background.default,
    },
    loadingText: {
      marginTop: 16,
      color: colors.text.secondary,
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      color: colors.text.secondary,
      fontSize: 16,
    },
    profileContainer: {
      flex: 1,
    },
    contentContainer: {
      maxWidth: 1400, // Maximum width for content
      width: "100%",
      alignSelf: "center", // Center the container
      paddingHorizontal: Platform.select({
        web: (() => {
          const screenWidth = Dimensions.get("window").width;
          // Add more padding on very wide screens
          if (screenWidth > 1600) return 48;
          if (screenWidth > 1400) return 32;
          if (screenWidth > 1200) return 24;
          return 16;
        })(),
        default: 16,
      }),
    },
    desktopHeader: {
      flexDirection: "row",
      alignItems: "stretch", // This ensures both panels have same height
      marginTop: 16,
      marginBottom: 12,
    },
    profileCard: {
      backgroundColor: colors.background.paper,
      margin: 16,
      padding: 24,
      borderRadius: 12,
      alignItems: "center",
      ...Platform.select({
        web: {
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
      }),
    },
    profileCardDesktop: {
      margin: 0,
      marginRight: isWeb() ? 6 : "1%",
      flex: 0,
      // 1/3 width for photo panel, accounting for gap
      width: isWeb() ? "calc(33.333% - 8px)" : "32%",
      minWidth: 280,
      justifyContent: "center",
      alignSelf: "stretch", // Match height of Quick Info
      // Match categorySection styling for consistency
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: "none",
      padding: 24,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    avatarPlaceholder: {
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: 48,
      fontWeight: "bold",
    },
    profileName: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 8,
    },
    profileAge: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    pronounChip: {
      backgroundColor: colors.background.manila,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 8,
    },
    pronounText: {
      color: colors.text.primary,
      fontSize: 14,
    },
    categoriesContainer: {
      paddingTop: 16,
      paddingBottom: 100, // Space for FAB
    },
    categoriesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -6, // Negative margin for gap compensation
    },
    categorySection: {
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      marginBottom: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      // Default to full width, will be overridden dynamically for desktop
      width: "100%",
      marginHorizontal: 0,
    },
    quickInfoSection: {
      width: "100%",
      marginHorizontal: 0,
      marginTop: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden", // For proper border radius clipping
      backgroundColor: colors.background.paper,
    },
    quickInfoDesktop: {
      // Standalone styles for desktop Quick Info (not inheriting from categorySection)
      flex: 1,
      marginLeft: isWeb() ? 6 : "1%",
      display: "flex",
      flexDirection: "column",
      alignSelf: "stretch", // Match height of profile card
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden", // For proper border radius clipping
      // Removed paddingVertical to allow header to extend to edges
    },
    quickInfoContentDesktop: {
      flex: 1,
      justifyContent: "flex-start", // Align content to top
      display: "flex",
      flexDirection: "column",
      padding: 16, // Regular content padding
      paddingTop: 22, // Extra padding to match profile card height
      paddingBottom: 22, // Extra padding to match profile card height
    },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: (() => {
        // Create proper shading for each theme
        if (theme === "dark") {
          return "#1F1F1F"; // Slightly darker than dark paper (#2A2A2A)
        } else if (theme === "light") {
          return "#F8F8F8"; // Slightly gray tinted for light mode
        } else {
          // Manylla theme already has good distinction
          return colors.background.secondary || "#F2E6D5";
        }
      })(),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryColorStrip: {
      width: 4,
      height: 24,
      borderRadius: 2,
      marginRight: 12,
    },
    categoryTitle: {
      flex: 1,
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: "600",
    },
    addButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonText: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: "400",
      lineHeight: 18,
    },
    categoryContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8,
      backgroundColor: colors.background.paper || colors.background.default,
    },
    emptyCategory: {
      color: colors.text.disabled,
      fontStyle: "italic",
    },
    entryItem: {
      paddingVertical: 6, // Reduced from 12px to 6px
      marginTop: 6, // Reduced from 12px to 6px
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    entryTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      flex: 1,
    },
    entryDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    entryActions: {
      flexDirection: "row",
      gap: 4,
      marginLeft: 8,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    entryDate: {
      fontSize: 12,
      color: colors.text.disabled,
      marginTop: 8,
    },
    quickInfoPanel: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    quickInfoTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 6,
    },
    quickInfoValue: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    // Base FAB styles shared by both FABs
    fabBase: {
      position: isWeb() ? "fixed" : "absolute",
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      ...Platform.select({
        web: {
          boxShadow:
            "0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12)",
          cursor: "pointer",
          position: "fixed",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.37,
          shadowRadius: 7.49,
          elevation: 12,
        },
      }),
    },
    fabLeft: {
      position: isWeb() ? "fixed" : "absolute",
      bottom: 24,
      left: 24, // LEFT side for Add Entry
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      ...Platform.select({
        web: {
          boxShadow:
            "0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12)",
          cursor: "pointer",
          position: "fixed",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.37,
          shadowRadius: 7.49,
          elevation: 12,
        },
      }),
    },
    fabRight: {
      position: isWeb() ? "fixed" : "absolute",
      bottom: 24,
      right: 24, // RIGHT side for Settings Menu
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      ...Platform.select({
        web: {
          boxShadow:
            "0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12)",
          cursor: "pointer",
          position: "fixed",
        },
        default: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.37,
          shadowRadius: 7.49,
          elevation: 12,
        },
      }),
    },
    fabPressed: {
      ...Platform.select({
        web: {
          transform: "scale(0.95)",
        },
        default: {
          elevation: 6,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
      }),
    },
    fabIcon: {
      color: "#FFFFFF",
      fontSize: 24,
    },
    // Left FAB text (+ icon) - requires upward adjustment on iOS
    fabTextLeft: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "300",
      ...Platform.select({
        ios: {
          lineHeight: 56, // Match FAB height for perfect vertical centering on iOS
          textAlignVertical: "center",
          paddingTop: -2, // Negative padding to push + icon up (different glyph metrics than ⋮)
        },
        android: {
          lineHeight: 28,
        },
        web: {
          lineHeight: 56, // Match FAB height for perfect vertical centering on web
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        default: {
          lineHeight: 28,
        },
      }),
    },
    // Right FAB text (⋮ icon) - works correctly with slight downward adjustment
    fabTextRight: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "300",
      ...Platform.select({
        ios: {
          lineHeight: 56, // Match FAB height for perfect vertical centering on iOS
          textAlignVertical: "center",
          paddingTop: 2, // Fine-tune vertical positioning for iOS (⋮ character centers well)
        },
        android: {
          lineHeight: 28,
        },
        web: {
          lineHeight: 56, // Match FAB height for perfect vertical centering on web
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        default: {
          lineHeight: 28,
        },
      }),
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 24,
      width: "90%",
      maxWidth: 500,
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 16,
    },
    modalCloseButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    modalCloseText: {
      fontSize: 28,
      color: colors.text.secondary,
    },
  });
};

// Default styles using default colors (for initial render)
// styles variable removed - was unused

// Main App wrapper
function App() {
  const RootView = isWeb() ? View : GestureHandlerRootView;
  const AppWrapper = isWeb() ? View : SafeAreaProvider;

  // Android Text component initialization fix (S029)
  // Text components fail to initialize properly when wrapped in complex provider hierarchy
  // on Android. Adding a small delay ensures native modules are fully initialized.
  const [isAndroidReady, setIsAndroidReady] = useState(!isAndroid());

  useEffect(() => {
    if (isAndroid()) {
      // Use requestAnimationFrame to ensure native bridge is ready
      // This allows Text native modules to initialize properly before rendering
      requestAnimationFrame(() => {
        setIsAndroidReady(true);
      });
    }
  }, []);

  // Show nothing while Android initializes (happens in <16ms, not noticeable)
  if (!isAndroidReady) {
    return null;
  }

  return (
    <AppWrapper>
      <RootView style={{ flex: 1 }}>
        <ThemeProvider initialThemeMode="manylla">
          <SyncProvider>
            <AppContent />
          </SyncProvider>
        </ThemeProvider>
      </RootView>
    </AppWrapper>
  );
}

export default App;
