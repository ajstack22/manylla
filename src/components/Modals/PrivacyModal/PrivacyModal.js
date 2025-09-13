import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  FlatList,
  Platform,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { createStyles } from "./styles";

const PrivacyModal = ({
  visible,
  onClose,
  insets,
  forceManyllaTheme = false,
}) => {
  const { colors: contextColors, theme } = useTheme();

  // Use manylla theme during onboarding, current theme after
  const useManyllaTheme = forceManyllaTheme || !theme;

  // Define manylla colors for onboarding
  const manyllaColors = {
    background: {
      primary: "#C4A66B", // Actual manila envelope color
      secondary: "#D4B896", // Lighter manila for cards
    },
    text: {
      primary: "#3D2F1F", // Dark brown text
      secondary: "#5D4A37", // Medium brown
    },
    border: "#A68B5B", // Darker manila for borders
    primary: "#5D4E37", // Dark brown for primary elements
  };

  // Use manylla theme for onboarding, context theme otherwise
  const colors = useManyllaTheme ? manyllaColors : contextColors;
  const styles = createStyles(colors);
  const content = [
    { type: "title", text: "Privacy Policy" },
    { type: "subtitle", text: "Last updated: September 12, 2025" },
    {
      type: "section",
      title: "Overview",
      text: "Manylla is designed with privacy as a core principle. We believe families managing special needs information deserve tools that respect their privacy and give them control over their data.",
    },
    {
      type: "section",
      title: "Data Collection",
      text: "We collect NO personal data by default. Manylla works entirely offline on your device.",
    },
    {
      type: "section",
      title: "Data Storage",
      text: "• All profile data is stored locally on your device by default\n• No data is sent to our servers unless you enable sync\n• Your profiles, entries, and settings stay on your device",
    },
    {
      type: "section",
      title: "Zero-Knowledge Sync (Optional)",
      text: "If you choose to enable sync between devices:\n• Zero-knowledge architecture: Your data is encrypted on your device before syncing\n• We cannot read your data: Only you have the decryption key\n• Your sync key is your only access: If lost, data cannot be recovered\n• Automatic cleanup: Inactive sync data is deleted after 6 months\n• No accounts required: Sync works with just your recovery phrase",
    },
    {
      type: "section",
      title: "Children's Privacy",
      text: "Manylla is designed for managing information about children:\n• We don't collect any information from children\n• No accounts or sign-ups required\n• No social features or communication between users\n• No behavioral tracking or analytics",
    },
    {
      type: "section",
      title: "Third-Party Services",
      text: "Manylla uses minimal third-party services:\n• No analytics - We don't track usage\n• No advertising - We don't show ads\n• No external APIs - Everything runs locally except optional sync\n• Sync servers (optional) - Only store encrypted data we cannot decrypt",
    },
    {
      type: "section",
      title: "Your Rights",
      text: "You have complete control:\n• Export your data anytime\n• Delete your data anytime (local or synced)\n• Use the app without any account or sync\n• Sync is always optional and can be disabled\n• Request deletion of synced data via the app",
    },
    {
      type: "section",
      title: "Contact",
      text: "Questions about privacy? Email: privacy@manylla.com",
    },
    {
      type: "footer",
      text: "Manylla respects your family's privacy and gives you complete control over your data.",
    },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "title":
        return <Text style={styles.title}>{item.text}</Text>;
      case "subtitle":
        return <Text style={styles.subtitle}>{item.text}</Text>;
      case "section":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionText}>{item.text}</Text>
          </View>
        );
      case "footer":
        return <Text style={styles.footer}>{item.text}</Text>;
      default:
        return null;
    }
  };

  const renderContent = () => {
    // Platform-specific scroll handling
    if (Platform.OS === "android") {
      // Android: FlatList for better performance
      return (
        <FlatList
          data={content}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        />
      );
    } else {
      // iOS/Web: ScrollView with native scrolling
      return (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {content.map((item, index) => (
            <View key={index}>{renderItem({ item })}</View>
          ))}
        </ScrollView>
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {Platform.OS === "android" && (
        <StatusBar
          backgroundColor={colors.background.primary}
          barStyle={
            theme === "dark" && !useManyllaTheme
              ? "light-content"
              : "dark-content"
          }
        />
      )}
      <SafeAreaView
        style={[styles.container, { paddingTop: insets?.top || 0 }]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoAvatar, styles.logoAvatarPlaceholder]}>
              <Text style={styles.logoAvatarText}>m</Text>
            </View>
            <Text style={styles.logo}>manylla</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

export default PrivacyModal;
