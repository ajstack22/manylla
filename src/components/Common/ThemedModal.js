import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { CloseIcon } from "./index";
import platform from "../../utils/platform";

/**
 * ThemedModal - A unified modal component with consistent styling
 * Now always uses theme colors to match the bottom toolbar aesthetic
 *
 * @param {boolean} visible - Whether the modal is visible
 * @param {function} onClose - Function to call when closing the modal
 * @param {string} title - Title to display in the header
 * @param {ReactNode} children - Content to display in the modal body
 * @param {string} presentationStyle - Modal presentation style (default: "pageSheet")
 * @param {boolean} showCloseButton - Whether to show the close button (default: true)
 * @param {string} headerStyle - DEPRECATED - Now always uses theme colors
 */
export const ThemedModal = ({
  visible,
  onClose,
  title,
  children,
  presentationStyle = "pageSheet",
  showCloseButton = true,
  headerStyle, // Kept for backward compatibility but ignored
}) => {
  const { colors, theme } = useTheme();

  // Match the working area and toolbar styling
  const headerBackground =
    colors.background?.paper || colors.surface || "#FFFFFF";
  const headerTextColor = colors.text?.primary || colors.primary || "#333333";
  const iconColor = colors.text?.secondary || colors.text?.primary || "#666666";
  const borderColor = colors.divider || colors.border || "#E0E0E0";
  const contentBackground =
    colors.background?.default || colors.background || "#F5F5F5";

  const styles = getStyles(
    colors,
    theme,
    headerBackground,
    headerTextColor,
    iconColor,
    borderColor,
    contentBackground,
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
      transparent={false}
      testID="themed-modal"
    >
      <SafeAreaView style={styles.container}>
        {/* Header - matching bottom toolbar style */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: headerBackground, // FORCE inline style to override RNW classes
            },
          ]}
          testID="modal-header"
          data-testid="modal-header"
        >
          <View style={styles.headerSpacer} />

          <Text
            style={styles.headerTitle}
            testID="modal-title"
            data-testid="modal-title"
            numberOfLines={1}
          >
            {title}
          </Text>

          {showCloseButton ? (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              testID="modal-close"
              data-testid="modal-close"
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <CloseIcon size={24} color={iconColor} />
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

const getStyles = (
  colors,
  theme,
  headerBackground,
  headerTextColor,
  iconColor,
  borderColor,
  contentBackground,
) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: contentBackground,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      // backgroundColor set via inline style to override RNW classes
      paddingHorizontal: 16,
      height: platform.select({
        ios: 56,
        android: 56,
        web: 56, // Consistent height matching bottom toolbar
      }),
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      // Subtle shadow to match bottom toolbar
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 3,
      ...platform.select({
        web: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        },
      }),
    },
    headerTitle: {
      fontSize: platform.select({
        ios: 18,
        android: 18,
        web: 18,
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
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
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
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
      backgroundColor: contentBackground,
    },
  });
};

export default ThemedModal;
