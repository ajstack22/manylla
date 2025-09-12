import platform from "../../utils/platform";

/**
 * ThemeSwitcher - Toggle between light/dark/manylla themes
 * Matches the original web implementation
 */

import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../../context";
import { DarkModeIcon, LightModeIcon, PaletteIcon } from "./IconProvider";

export const ThemeSwitcher = ({ style }) => {
  const { themeMode, toggleTheme, colors } = useTheme();
  const styles = createStyles(colors);

  const getIcon = () => {
    switch (themeMode) {
      case "light":
        return <LightModeIcon size={24} color={colors.text.primary} />;
      case "dark":
        return <DarkModeIcon size={24} color={colors.text.primary} />;
      case "manylla":
        return <PaletteIcon size={24} color={colors.text.primary} />;
      default:
        return <PaletteIcon size={24} color={colors.text.primary} />;
    }
  };

  const getLabel = () => {
    switch (themeMode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "manylla":
        return "Manylla";
      default:
        return "Theme";
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      {platform.isWeb && <Text style={styles.label}>{getLabel()}</Text>}
    </TouchableOpacity>
  );
};

// Compact icon-only version
export const ThemeSwitcherIcon = ({ size = 24, color, style }) => {
  const { themeMode, toggleTheme, colors } = useTheme();
  const iconColor = color || colors.text.primary;

  const getIcon = () => {
    switch (themeMode) {
      case "light":
        return <LightModeIcon size={size} color={iconColor} />;
      case "dark":
        return <DarkModeIcon size={size} color={iconColor} />;
      case "manylla":
        return <PaletteIcon size={size} color={iconColor} />;
      default:
        return <PaletteIcon size={size} color={iconColor} />;
    }
  };

  return (
    <TouchableOpacity
      style={style}
      onPress={toggleTheme}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {getIcon()}
    </TouchableOpacity>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.background.paper || "#FFFFFF",
      borderWidth: 1,
      borderColor: colors.border || "#E0E0E0",
    },
    iconContainer: {
      marginRight: platform.isWeb ? 8 : 0,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.primary || "#000000",
      fontFamily: platform.isWeb
        ? '"Atkinson Hyperlegible", -apple-system, sans-serif'
        : undefined,
    },
  });

export default ThemeSwitcher;
