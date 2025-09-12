import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import { getShadowStyle } from "../../utils/platformStyles";
import platform from "../../utils/platform";

/**
 * ThemedModal - A unified modal component with consistent styling
 *
 * @param {boolean} visible - Whether the modal is visible
 * @param {function} onClose - Function to call when closing the modal
 * @param {string} title - Title to display in the header
 * @param {ReactNode} children - Content to display in the modal body
 * @param {string} presentationStyle - Modal presentation style (default: "pageSheet")
 * @param {boolean} showCloseButton - Whether to show the close button (default: true)
 * @param {string} headerStyle - Style variant for header: "primary" | "surface" (default: "primary")
 */
export const ThemedModal = ({
  visible,
  onClose,
  title,
  children,
  presentationStyle = "pageSheet",
  showCloseButton = true,
  headerStyle = "primary",
}) => {
  const { colors, theme } = useTheme();
  const isHeaderPrimary = headerStyle === "primary";
  
  // Ensure we have valid colors with fallbacks
  const primaryColor = colors.primary || '#8B6F47'; // Brown fallback
  const headerBackground = isHeaderPrimary ? primaryColor : colors.background.paper;
  const headerTextColor = isHeaderPrimary ? '#FFFFFF' : (colors.text?.primary || '#333333');
  const iconColor = isHeaderPrimary ? '#FFFFFF' : (colors.text?.secondary || '#666666');
  
  const styles = getStyles(colors, theme, headerStyle, headerBackground, headerTextColor);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />

          <Text style={styles.headerTitle}>{title}</Text>

          {showCloseButton ? (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon 
                name="close" 
                size={24} 
                color={iconColor}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (colors, theme, headerStyle, headerBackground, headerTextColor) => {
  const isHeaderPrimary = headerStyle === "primary";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: headerBackground,
      paddingHorizontal: 16,
      paddingVertical: platform.select({
        ios: 16,
        android: 16,
        web: 14,
      }),
      borderBottomWidth: isHeaderPrimary ? 0 : 1,
      borderBottomColor: isHeaderPrimary ? "transparent" : colors.border,
      // Add subtle shadow for depth
      ...getShadowStyle(3),
      ...platform.select({
        web: {
          boxShadow:
            theme === "dark"
              ? `0 2px 4px rgba(255,255,255,0.1)`
              : `0 2px 4px rgba(0,0,0,0.1)`,
        },
      }),
    },
    headerTitle: {
      fontSize: platform.select({
        ios: 18,
        android: 18,
        web: 17,
      }),
      fontWeight: "600",
      color: headerTextColor,
      flex: 1,
      textAlign: "center",
      letterSpacing: platform.select({
        ios: 0.35,
        android: 0.25,
        web: 0.15,
      }),
    },
    closeButton: {
      padding: 8,
      marginRight: -8,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
    },
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
  });
};

export default ThemedModal;
