/**
 * UnifiedModal - StackMap's modal architecture with Manylla aesthetics
 * StackMap patterns:
 * - Structured header with icon/title/close
 * - X close button on right (no Cancel)
 * - Card-based content sections
 * - iOS panel expansion fixes
 * Manylla aesthetics:
 * - Manila brown headers (#8B7355)
 * - Warm paper backgrounds
 * - Atkinson Hyperlegible font
 */

import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { CloseIcon } from "./IconProvider";
import { useTheme } from "../../context";

export const UnifiedModal = ({
  visible,
  onClose,
  title,
  icon: IconComponent,
  children,
  footer,
  fullScreen = false,
  ...props
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      presentationStyle={Platform.OS === "web" ? "pageSheet" : "fullScreen"}
      {...props}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: colors.primary }]}
      >
        {Platform.OS !== "web" && (
          <StatusBar
            backgroundColor={colors.primary}
            barStyle="light-content"
          />
        )}

        {/* Header - Following StackMap pattern */}
        <View style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
          <View style={styles.headerLeft}>
            {IconComponent && (
              <View style={styles.headerIcon}>
                {typeof IconComponent === "function" ? (
                  <IconComponent size={28} color="white" />
                ) : (
                  IconComponent
                )}
              </View>
            )}
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeButton}
          >
            <CloseIcon size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content - Card-based sections */}
        <ScrollView
          style={[
            styles.modalScrollView,
            { backgroundColor: colors.background.default },
          ]}
          contentContainerStyle={[
            styles.scrollContent,
            // iOS modal panel expansion fix from StackMap
            Platform.OS === "ios" ? {} : { flexGrow: 1 },
          ]}
        >
          <View
            style={[
              styles.contentWrapper,
              Platform.OS === "ios" && {
                flex: 0,
                flexGrow: 0,
                flexShrink: 1,
              },
            ]}
          >
            {children}
          </View>
        </ScrollView>

        {/* Optional Footer */}
        {footer && (
          <View
            style={[
              styles.modalFooter,
              { backgroundColor: colors.background.default },
            ]}
          >
            {footer}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

// Card component for content sections
export const ModalCard = ({ children, style, ...props }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

// Section header component
export const ModalSection = ({ title, children, style, ...props }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.section, style]} {...props}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 56,
      backgroundColor: colors.primary || "#8B7355", // Manylla brown
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    headerIcon: {
      marginRight: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: Platform.OS === "ios" ? "700" : "bold",
      color: "#FFFFFF", // Always white in header
      fontFamily:
        Platform.OS === "web"
          ? '"Atkinson Hyperlegible", -apple-system, sans-serif'
          : undefined,
    },
    closeButton: {
      padding: 40,
    },
    modalScrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    contentWrapper: {
      padding: 16,
    },
    modalFooter: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border || "#E0E0E0",
    },

    // Card styles
    card: {
      backgroundColor: colors.background.paper || "#FFFFFF",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      }),
    },

    // Section styles
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: Platform.OS === "ios" ? "600" : "bold",
      color: colors.text.primary || "#333333", // Manylla text color
      marginBottom: 8,
      fontFamily:
        Platform.OS === "web"
          ? '"Atkinson Hyperlegible", -apple-system, sans-serif'
          : undefined,
    },

    // Text styling
    text: {
      fontSize: 14,
      color: colors.text.primary || "#333333", // Manylla text color
      lineHeight: 20,
      fontFamily:
        Platform.OS === "web"
          ? '"Atkinson Hyperlegible", -apple-system, sans-serif'
          : undefined,
    },
  });

export default UnifiedModal;
