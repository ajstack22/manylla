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
  Linking,
  Image,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { createStyles } from "./styles";
import BuyMeCoffeeButton from "../../BuyMeCoffeeButton/BuyMeCoffeeButton";

const SupportModal = ({
  visible,
  onClose,
  insets,
  forceManyllaTheme = false,
}) => {
  const { colors: contextColors, theme } = useTheme();

  // Use manylla theme during onboarding, current theme after
  const useManyllaTheme = forceManyllaTheme || !theme;

  // Define manylla colors for consistent branding
  const manyllaColors = {
    background: {
      primary: "#F4E4C1", // Manila envelope background
      secondary: "#F9F0E1", // Lighter manila for cards
    },
    text: {
      primary: "#3D2F1F", // Dark brown text
      secondary: "#5D4A37", // Medium brown
    },
    border: "#A68B5B", // Darker manila for borders
    primary: "#A08670", // Manila brown for primary elements
  };

  // Use manylla theme for consistent branding
  const colors = useManyllaTheme ? manyllaColors : contextColors;
  const styles = createStyles(colors);

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@manylla.com");
  };

  const handleBuyMeCoffeePress = () => {
    Linking.openURL("https://www.buymeacoffee.com/stackmap");
  };

  const content = [
    { type: "title", text: "Support Manylla" },
    { type: "subtitle", text: "Help us support special needs families" },
    {
      type: "hero",
      title: "Our Mission",
      text: "Manylla exists to help families managing special needs information with privacy-first tools that give you complete control over your data.",
    },
    {
      type: "team-photo",
      title: "Meet Our Team",
      text: "A small team dedicated to building tools that respect your privacy and support your family's needs.",
    },
    {
      type: "impact",
      title: "Why Your Support Matters",
      items: [
        {
          title: "Privacy Protection",
          description:
            "Zero-knowledge encryption keeps your family's information secure",
        },
        {
          title: "Free Sync Service",
          description: "Multi-device sync without compromising your privacy",
        },
        {
          title: "Continuous Development",
          description:
            "Regular updates and new features based on your feedback",
        },
      ],
    },
    {
      type: "donation",
      title: "Buy Me a Coffee",
      text: "Your support helps us maintain servers, develop new features, and keep Manylla free for families who need it most.",
    },
    {
      type: "ways-to-help",
      title: "Other Ways to Contribute",
      items: [
        {
          title: "⭐ Review",
          description: "Leave a review on your app store",
          action: "Share your experience",
        },
        {
          title: "📱 Share",
          description: "Tell other families about Manylla",
          action: "Spread the word",
        },
        {
          title: "💬 Feedback",
          description: "Help us improve with your suggestions",
          action: "Send feedback",
        },
        {
          title: "💡 Ideas",
          description: "Suggest features that would help your family",
          action: "Share ideas",
        },
      ],
    },
    {
      type: "contact",
      title: "Get in Touch",
      text: "Questions, feedback, or just want to say hello?",
      email: "support@manylla.com",
    },
    {
      type: "footer",
      text: "Thank you for being part of the Manylla community and helping us build better tools for special needs families.",
    },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "title":
        return <Text style={styles.title}>{item.text}</Text>;
      case "subtitle":
        return <Text style={styles.subtitle}>{item.text}</Text>;
      case "hero":
        return (
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>{item.title}</Text>
            <Text style={styles.heroText}>{item.text}</Text>
          </View>
        );
      case "team-photo":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.teamPhotoContainer}>
              {Platform.OS === "web" ? (
                <img
                  src="/StackMapTeam.jpg"
                  alt="Manylla Team"
                  style={{
                    width: "100%",
                    maxWidth: 450,
                    height: 300,
                    borderRadius: 12,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Image
                  source={require("../../../../public/StackMapTeam.jpg")}
                  style={styles.teamPhoto}
                  resizeMode="cover"
                />
              )}
            </View>
            <Text style={styles.sectionText}>{item.text}</Text>
          </View>
        );
      case "impact":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.impactGrid}>
              {item.items.map((impactItem, index) => (
                <View key={index} style={styles.impactCard}>
                  <Text style={styles.impactCardTitle}>{impactItem.title}</Text>
                  <Text style={styles.impactCardDescription}>
                    {impactItem.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      case "donation":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionText}>{item.text}</Text>
            <View style={styles.donationContainer}>
              <BuyMeCoffeeButton onPress={handleBuyMeCoffeePress} />
            </View>
          </View>
        );
      case "ways-to-help":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.waysGrid}>
              {item.items.map((helpItem, index) => (
                <View key={index} style={styles.wayCard}>
                  <Text style={styles.wayCardIcon}>
                    {helpItem.title.split(" ")[0]}
                  </Text>
                  <Text style={styles.wayCardTitle}>
                    {helpItem.title.split(" ").slice(1).join(" ")}
                  </Text>
                  <Text style={styles.wayCardDescription}>
                    {helpItem.description}
                  </Text>
                  <Text style={styles.wayCardAction}>{helpItem.action}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case "contact":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionText}>{item.text}</Text>
            <TouchableOpacity
              onPress={handleEmailPress}
              style={styles.emailButton}
            >
              <Text style={styles.emailButtonText}>{item.email}</Text>
            </TouchableOpacity>
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

export default SupportModal;
