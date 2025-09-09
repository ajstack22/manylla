import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Modal,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface HeaderProps {
  onMenuClick?: () => void;
  onSyncClick?: () => void;
  onCloseProfile?: () => void;
  onShare?: () => void;
  onCategoriesClick?: () => void;
  syncStatus?: "not-setup" | "synced" | "error";
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSyncClick,
  onCloseProfile,
  onShare,
  onCategoriesClick,
  syncStatus = "not-setup",
}) => {
  const { themeMode, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  // Get sync icon based on status
  const getSyncIcon = () => {
    switch (syncStatus) {
      case "synced":
        return "☁️✓";
      case "error":
        return "☁️⚠️";
      case "not-setup":
      default:
        return "☁️";
    }
  };

  const getSyncColor = () => {
    switch (syncStatus) {
      case "synced":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "not-setup":
      default:
        return "#666";
    }
  };

  const handleMenuItemPress = (action: () => void | undefined) => {
    setShowMenu(false);
    if (action) {
      setTimeout(action, 100); // Small delay to allow menu to close smoothly
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[styles.header, themeMode === "dark" && styles.headerDark]}
        >
          {/* Left side - Menu */}
          {onMenuClick && (
            <TouchableOpacity style={styles.iconButton} onPress={onMenuClick}>
              <Text style={styles.icon}>☰</Text>
            </TouchableOpacity>
          )}

          {/* Center - Title */}
          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, themeMode === "dark" && styles.titleDark]}
            >
              Manylla
            </Text>
          </View>

          {/* Right side - Actions */}
          <View style={styles.actions}>
            {/* Theme Toggle */}
            <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
              <Text style={styles.icon}>
                {themeMode === "dark" ? "☀️" : "🌙"}
              </Text>
            </TouchableOpacity>

            {/* Sync Status */}
            {onSyncClick && (
              <TouchableOpacity style={styles.iconButton} onPress={onSyncClick}>
                <Text style={[styles.icon, { color: getSyncColor() }]}>
                  {getSyncIcon()}
                </Text>
              </TouchableOpacity>
            )}

            {/* More Menu */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowMenu(true)}
            >
              <Text style={styles.icon}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showMenu}
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menu}>
              {onShare && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(onShare)}
                >
                  <Text style={styles.menuIcon}>🔗</Text>
                  <Text style={styles.menuText}>Share Profile</Text>
                </TouchableOpacity>
              )}

              {onCategoriesClick && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(onCategoriesClick)}
                >
                  <Text style={styles.menuIcon}>🏷️</Text>
                  <Text style={styles.menuText}>Manage Categories</Text>
                </TouchableOpacity>
              )}

              {onSyncClick && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(onSyncClick)}
                >
                  <Text style={styles.menuIcon}>{getSyncIcon()}</Text>
                  <Text style={styles.menuText}>Sync Settings</Text>
                </TouchableOpacity>
              )}

              {onCloseProfile && (
                <>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(onCloseProfile)}
                  >
                    <Text style={styles.menuIcon}>🚪</Text>
                    <Text style={styles.menuText}>Close Profile</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F4E4C1",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(139, 115, 85, 0.04)",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerDark: {
    backgroundColor: "rgba(139, 115, 85, 0.08)",
    borderBottomColor: "#444",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Pacifico-Regular",
    color: "#8B7355",
  },
  titleDark: {
    color: "#D4C4B0",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
    color: "#666",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuContainer: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingRight: 8,
  },
  menu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
});

export default Header;
