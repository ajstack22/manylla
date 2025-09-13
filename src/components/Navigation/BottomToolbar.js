import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import {
  ShareIcon,
  PrintIcon,
  CloudIcon,
  PaletteIcon,
  PrivacyTipIcon,
  SupportIcon,
  LogoutIcon,
  MoreHorizIcon,
  LightModeIcon,
  DarkModeIcon,
  CheckCircleIcon,
} from "../Common";
import platform from "../../utils/platform";

const BottomToolbar = ({
  onShare,
  onPrintClick,
  onSyncClick,
  onThemeToggle,
  onThemeSelect, // New prop for direct theme selection
  onPrivacyClick,
  onSupportClick,
  onCloseProfile,
  theme,
  colors,
  syncStatus,
  showToast,
}) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  // Use platform-specific bottom padding instead of SafeAreaInsets
  const bottomPadding = platform.isIOS ? 20 : 0;
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowWidth(window.width);
      // Close overflow menu on resize
      setShowOverflowMenu(false);
    });

    return () => subscription?.remove();
  }, []);
  
  // Get next theme name for toast
  const getNextThemeName = () => {
    if (theme === "light") return "Dark";
    if (theme === "dark") return "Manylla";
    return "Light";
  };
  
  // Handle item press
  const handleItemPress = (action, message) => {
    setShowOverflowMenu(false); // Close overflow if open
    setShowThemeMenu(false); // Close theme menu if open
    if (action) {
      action();
      if (message && showToast) {
        showToast(message, "info");
      }
    }
  };
  
  // Handle theme selection
  const handleThemeSelect = (selectedTheme) => {
    setShowThemeMenu(false);
    
    // If onThemeSelect is provided, use it for direct selection
    if (onThemeSelect) {
      onThemeSelect(selectedTheme);
      if (showToast) {
        const themeName = selectedTheme === "light" ? "Light" : 
                         selectedTheme === "dark" ? "Dark" : "manylla";
        showToast(`${themeName} theme activated`, "info");
      }
      return;
    }
    
    // Fallback: cycle through themes if direct selection not available
    // If already on selected theme, just show toast
    if (theme === selectedTheme) {
      if (showToast) {
        const themeName = selectedTheme === "light" ? "Light" : 
                         selectedTheme === "dark" ? "Dark" : "manylla";
        showToast(`${themeName} theme already active`, "info");
      }
      return;
    }
    
    // Calculate how many times to toggle to reach target
    const themeOrder = ["light", "dark", "manylla"];
    const currentIndex = themeOrder.indexOf(theme);
    const targetIndex = themeOrder.indexOf(selectedTheme);
    
    if (currentIndex === -1 || targetIndex === -1) return;
    
    const steps = (targetIndex - currentIndex + 3) % 3;
    
    // Use setTimeout to ensure proper state updates between toggles
    let remaining = steps;
    const toggleStep = () => {
      if (remaining > 0) {
        onThemeToggle();
        remaining--;
        if (remaining > 0) {
          setTimeout(toggleStep, 50); // Small delay between updates
        } else {
          // Show toast after final toggle
          if (showToast) {
            const themeName = selectedTheme === "light" ? "Light" : 
                             selectedTheme === "dark" ? "Dark" : "manylla";
            setTimeout(() => showToast(`${themeName} theme activated`, "info"), 100);
          }
        }
      }
    };
    
    if (steps > 0) {
      toggleStep();
    }
  };
  
  // Get sync status color
  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return colors.warning || "#FFA726";
      case "error":
        return colors.error || "#EF5350";
      case "success":
        return colors.success || "#66BB6A";
      default:
        return colors.text?.primary || colors.primary || "#A08670";
    }
  };
  
  const styles = createStyles(colors, bottomPadding);
  const isDesktop = platform.isWeb && windowWidth >= 768;
  const isNarrow = windowWidth < 600; // Show overflow menu on narrow screens
  
  const allMenuItems = [
    { id: "share", label: "Share", icon: ShareIcon, action: onShare },
    { id: "print", label: "Print", icon: PrintIcon, action: onPrintClick },
    { 
      id: "sync", 
      label: "Sync", 
      icon: CloudIcon, 
      action: onSyncClick,
      color: getSyncStatusColor() 
    },
    { 
      id: "theme", 
      label: "Theme", 
      icon: PaletteIcon, 
      action: () => setShowThemeMenu(!showThemeMenu)
    },
    { id: "privacy", label: "Privacy", icon: PrivacyTipIcon, action: onPrivacyClick },
    { id: "support", label: "Support Us", icon: SupportIcon, action: onSupportClick },
    { 
      id: "close", 
      label: "Close", 
      icon: LogoutIcon, 
      action: onCloseProfile,
      color: colors.error || "#EF5350"
    },
  ];
  
  // Determine which items to show based on screen width
  const visibleItems = isNarrow ? allMenuItems.slice(0, 5) : allMenuItems;
  const overflowItems = isNarrow ? allMenuItems.slice(5) : [];
  
  const MenuButton = ({ item, compact = false }) => {
    const Icon = item.icon;
    const itemColor = item.color || colors.text?.primary || colors.primary || "#A08670";
    
    return (
      <TouchableOpacity
        onPress={item.action}
        style={[
          styles.menuButton,
          isDesktop && !compact && styles.menuButtonDesktop,
          compact && styles.menuButtonCompact
        ]}
        accessibilityLabel={item.label}
        accessibilityRole="button"
      >
        <Icon 
          size={compact || !isDesktop ? 20 : 22} 
          color={itemColor} 
        />
        <Text style={[
          styles.menuLabel,
          { color: itemColor },
          isDesktop && !compact && styles.menuLabelDesktop,
          compact && styles.menuLabelCompact
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <>
      <View style={[
        styles.container,
        isDesktop && styles.containerDesktop
      ]}>
        {isNarrow ? (
          // Narrow screen: Scrollable horizontal layout
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {visibleItems.map((item) => (
              <MenuButton key={item.id} item={item} compact={true} />
            ))}
            {overflowItems.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowOverflowMenu(!showOverflowMenu)}
                style={[styles.menuButton, styles.menuButtonCompact]}
                accessibilityLabel="More options"
                accessibilityRole="button"
              >
                <MoreHorizIcon 
                  size={20} 
                  color={colors.text?.primary || colors.primary || "#A08670"} 
                />
                <Text style={[
                  styles.menuLabel,
                  styles.menuLabelCompact,
                  { color: colors.text?.primary || colors.primary || "#A08670" }
                ]}>
                  More
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : (
          // Wide screen: Fixed layout
          <View style={[
            styles.toolbar,
            isDesktop && styles.toolbarDesktop
          ]}>
            {visibleItems.map((item) => (
              <MenuButton key={item.id} item={item} />
            ))}
          </View>
        )}
      </View>
      
      {/* Overflow menu modal for mobile */}
      {isNarrow && (
        <Modal
          visible={showOverflowMenu && overflowItems.length > 0}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOverflowMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={() => setShowOverflowMenu(false)}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>More Options</Text>
              </View>
              {overflowItems.map((item) => {
                const Icon = item.icon;
                const itemColor = item.color || colors.text?.primary || colors.primary || "#A08670";
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleItemPress(item.action)}
                    style={styles.modalMenuItem}
                    accessibilityLabel={item.label}
                    accessibilityRole="button"
                  >
                    <Icon size={24} color={itemColor} />
                    <Text style={[styles.modalMenuLabel, { color: itemColor }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => setShowOverflowMenu(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      
      {/* Desktop overflow menu (box style) */}
      {!isNarrow && showOverflowMenu && overflowItems.length > 0 && (
        <>
          <TouchableOpacity 
            style={styles.overflowBackdrop}
            onPress={() => setShowOverflowMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.overflowMenu}>
            {overflowItems.map((item) => {
              const Icon = item.icon;
              const itemColor = item.color || colors.text?.primary || colors.primary || "#A08670";
              
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item.action)}
                  style={styles.overflowMenuItem}
                  accessibilityLabel={item.label}
                  accessibilityRole="button"
                >
                  <Icon size={22} color={itemColor} />
                  <Text style={[styles.overflowMenuLabel, { color: itemColor }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
      
      {/* Theme selection menu - Modal for mobile, dropdown for desktop */}
      {isNarrow ? (
        <Modal
          visible={showThemeMenu}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowThemeMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={() => setShowThemeMenu(false)}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Theme</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleThemeSelect("light")}
                style={styles.modalMenuItem}
                accessibilityLabel="Light theme"
                accessibilityRole="button"
              >
                <LightModeIcon size={24} color={colors.text?.primary || colors.primary || "#333"} />
                <Text style={[styles.modalMenuLabel, { color: colors.text?.primary || colors.primary || "#333" }]}>
                  Light
                </Text>
                {theme === "light" && <CheckCircleIcon size={20} color={colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleThemeSelect("dark")}
                style={styles.modalMenuItem}
                accessibilityLabel="Dark theme"
                accessibilityRole="button"
              >
                <DarkModeIcon size={24} color={colors.text?.primary || colors.primary || "#333"} />
                <Text style={[styles.modalMenuLabel, { color: colors.text?.primary || colors.primary || "#333" }]}>
                  Dark
                </Text>
                {theme === "dark" && <CheckCircleIcon size={20} color="#FFFFFF" />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleThemeSelect("manylla")}
                style={styles.modalMenuItem}
                accessibilityLabel="Manylla theme"
                accessibilityRole="button"
              >
                <PaletteIcon size={24} color={theme === "dark" ? "#FFFFFF" : (colors.text?.primary || colors.primary || "#333")} />
                <Text style={[styles.modalMenuLabel, { color: colors.text?.primary || colors.primary || "#333" }]}>
                  manylla
                </Text>
                {theme === "manylla" && <CheckCircleIcon size={20} color={colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowThemeMenu(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      ) : (
        showThemeMenu && (
          <>
            <TouchableOpacity 
              style={styles.overflowBackdrop}
              onPress={() => setShowThemeMenu(false)}
              activeOpacity={1}
            />
            <View style={[styles.overflowMenu, styles.themeMenu]}>
              <TouchableOpacity
                onPress={() => handleThemeSelect("light")}
                style={styles.overflowMenuItem}
                accessibilityLabel="Light theme"
                accessibilityRole="button"
              >
                <LightModeIcon size={22} color={colors.text?.primary || colors.primary || "#A08670"} />
                <Text style={[styles.overflowMenuLabel, { color: colors.text?.primary || colors.primary || "#A08670" }]}>
                  Light
                </Text>
                {theme === "light" && <CheckCircleIcon size={18} color={colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleThemeSelect("dark")}
                style={styles.overflowMenuItem}
                accessibilityLabel="Dark theme"
                accessibilityRole="button"
              >
                <DarkModeIcon size={22} color={colors.text?.primary || colors.primary || "#A08670"} />
                <Text style={[styles.overflowMenuLabel, { color: colors.text?.primary || colors.primary || "#A08670" }]}>
                  Dark
                </Text>
                {theme === "dark" && <CheckCircleIcon size={18} color="#FFFFFF" />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleThemeSelect("manylla")}
                style={styles.overflowMenuItem}
                accessibilityLabel="Manylla theme"
                accessibilityRole="button"
              >
                <PaletteIcon size={22} color={theme === "dark" ? "#FFFFFF" : (colors.text?.primary || colors.primary || "#A08670")} />
                <Text style={[styles.overflowMenuLabel, { color: colors.text?.primary || colors.primary || "#A08670" }]}>
                  manylla
                </Text>
                {theme === "manylla" && <CheckCircleIcon size={18} color={colors.primary} />}
              </TouchableOpacity>
            </View>
          </>
        )
      )}
    </>
  );
};

const createStyles = (colors, bottomPadding) => StyleSheet.create({
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background?.paper || colors.surface || "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colors.divider || "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
    paddingBottom: bottomPadding,
    zIndex: 999,
  },
  containerDesktop: {
    height: 56, // Narrower for desktop
    paddingBottom: 0,
  },
  scrollContainer: {
    height: 64,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    minWidth: "100%",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 64,
  },
  toolbarDesktop: {
    height: 56,
    paddingVertical: 4,
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
  },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    minWidth: 64,
    borderRadius: 8,
    ...platform.select({
      web: {
        cursor: "pointer",
        transition: "background-color 0.2s",
        ":hover": {
          backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
        },
      },
    }),
  },
  menuButtonCompact: {
    width: 60,  // Fixed width for consistency
    paddingHorizontal: 4,
    marginHorizontal: 2,
  },
  menuButtonDesktop: {
    flexDirection: "row",
    gap: 6,
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuLabel: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
    marginTop: 2,
  },
  menuLabelCompact: {
    fontSize: 10,
  },
  menuLabelDesktop: {
    fontSize: 13,
    marginTop: 0,
  },
  overflowBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 1000,
  },
  overflowMenu: {
    position: "fixed",
    bottom: 74, // Above toolbar
    left: "50%",
    marginLeft: -100, // Half of minWidth to center
    backgroundColor: colors.background?.paper || colors.surface || "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.divider || "#E0E0E0",
    paddingVertical: 8,
    width: 200,
    zIndex: 1001,
  },
  overflowMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  overflowMenuLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Modal styles for mobile
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background?.paper || colors.surface || "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: bottomPadding + 20,
    paddingHorizontal: 0,
    minHeight: 250,
  },
  modalHeader: {
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider || "#E0E0E0",
    marginBottom: 10,
    marginHorizontal: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text?.primary || colors.primary || "#333333",
  },
  modalMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  modalMenuLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  modalCancelButton: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.action?.hover || "rgba(0,0,0,0.04)",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text?.primary || colors.primary || "#333333",
  },
  themeMenu: {
    bottom: 74,
    left: "50%",
    marginLeft: -80, // Half of width (160/2) to center
    right: "auto",
    width: 160,
  },
});

export default BottomToolbar;