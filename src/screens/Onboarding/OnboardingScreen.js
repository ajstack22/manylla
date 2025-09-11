// React imports
import React, { useState } from "react";

// React Native imports
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from "react-native";

// Third-party libraries
import AsyncStorage from "@react-native-async-storage/async-storage";

// Context/Hooks
import { useTheme } from "../../context/ThemeContext";
import { getTextStyle, getScrollViewProps } from "../../utils/platformStyles";

// Components
import {
  AddIcon,
  PersonIcon,
  ShareIcon,
  MenuIcon,
  CloseIcon,
} from "../../components/Common";

// Import Ellie image for React Native
const EllieImage = Platform.OS !== "web" ? require("../../ellie.png") : null;

// Services
import { StorageService } from "../../services/storage/storageService";

// Utils and types
import { ChildProfile } from "../../types/ChildProfile";
import { unifiedCategories } from "../../utils/unifiedCategories";

// Helper function to map category IDs to icons
const getIconForCategory = (categoryId) => {
  const iconMap = {
    "quick-info": "info",
    "daily-support": "support",
    "health-therapy": "health",
    "education-goals": "education",
    "behavior-social": "social",
    "family-resources": "family",
  };
  return iconMap[categoryId] || "folder";
};

const OnboardingScreen = ({ onComplete }) => {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [accessCode, setAccessCode] = useState("");
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [photo, setPhoto] = useState(null); // Standardized to null as empty value
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Maximum file size (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const VALID_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // Format date for display (MM/DD/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Format date input with automatic slashes for mobile
  const formatDateInput = (text) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "");

    // Apply MM/DD/YYYY format
    let formatted = cleaned;
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length >= 5) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    return formatted;
  };

  // Handle photo picker functionality with proper validation
  const handlePhotoPicker = () => {
    setErrorMessage(""); // Clear any previous errors

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // Validate file type
          if (!VALID_IMAGE_TYPES.includes(file.type)) {
            setErrorMessage(
              "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
            );
            return;
          }

          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            setErrorMessage("Image size must be less than 5MB");
            return;
          }

          setIsProcessingPhoto(true);
          const reader = new FileReader();

          reader.onload = (e) => {
            setPhoto(e.target.result);
            setIsProcessingPhoto(false);
          };

          reader.onerror = () => {
            setErrorMessage("Failed to read image file");
            setIsProcessingPhoto(false);
          };

          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // TECH DEBT: Mobile photo picker not yet implemented
      // TODO: Integrate react-native-image-picker library for mobile photo selection
      // Current workaround: Users can add photos later via web interface
      // Impact: Mobile users cannot add photos during onboarding
      // Priority: HIGH - affects all mobile users
      setErrorMessage(
        "Photo selection is currently only available on web. You can add photos later.",
      );
    }
  };

  // Handle date change for both web and mobile
  const handleDateChange = (value) => {
    if (Platform.OS === "web") {
      setDateOfBirth(value);
    } else {
      // Mobile text input with formatting
      const formatted = formatDateInput(value);
      setDateOfBirth(formatted);
    }
  };

  const handleStartFresh = () => {
    setStep(1); // Go to child info page
  };

  const handleChildInfoSubmit = async () => {
    // Clear any previous errors
    setErrorMessage("");

    if (!childName.trim()) {
      setErrorMessage("Please enter the child's name");
      return;
    }

    // If onComplete prop provided (App.js usage), just return the data
    if (onComplete) {
      onComplete({
        mode: "fresh",
        childName: childName.trim(),
        dateOfBirth: dateOfBirth || undefined,
        photo: photo || null, // Standardized to null
      });
      return;
    }

    // Otherwise handle profile creation directly (navigation usage)
    const newProfile = {
      id: Date.now().toString(),
      name: childName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
      photo: photo || null, // Standardized to null
      categories: unifiedCategories.map((cat) => ({
        ...cat,
        icon: getIconForCategory(cat.id),
      })),
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // This path is only for navigation usage, not App.js usage
    // await saveProfiles([newProfile]);
    // await setCurrentProfile(newProfile);
    // For now, just save to storage directly
    await StorageService.saveProfile(newProfile);
  };

  const handleJoinWithCode = async (code) => {
    // If onComplete prop provided (App.js usage), just return the data
    if (onComplete) {
      onComplete({
        mode: "join",
        accessCode: code,
      });
      return;
    }
    // TODO: Implement joining with sync code for navigation usage
  };

  const handleDemoMode = async () => {
    // If onComplete prop provided (App.js usage), just return the mode
    if (onComplete) {
      onComplete({ mode: "demo" });
      return;
    }
    // Clear any existing profiles first to ensure clean demo
    await AsyncStorage.removeItem("profiles");
    await AsyncStorage.removeItem("childProfile"); // Also clear old storage key
    await AsyncStorage.removeItem("manylla_profile"); // Clear any legacy keys

    // Create a demo profile with sample data
    const demoProfile = {
      id: "demo-" + Date.now(),
      name: "Ellie Thompson",
      preferredName: "Ellie",
      pronouns: "she/her",
      dateOfBirth: new Date("2018-06-15"),
      photo:
        Platform.OS === "web"
          ? "/ellie.png"
          : Image.resolveAssetSource(EllieImage).uri,
      // Use unified categories from the shared configuration with icons added
      categories: unifiedCategories.map((cat) => ({
        ...cat,
        icon: getIconForCategory(cat.id),
      })),
      entries: [
        {
          id: "1",
          category: "quick-info",
          title: "Communication",
          description:
            "Non-verbal when overwhelmed - uses AAC device with picture cards",
          date: new Date(),
        },
        {
          id: "2",
          category: "quick-info",
          title: "Emergency Contact",
          description: "Mom (Emily) - 555-0123",
          date: new Date(),
        },
        {
          id: "3",
          category: "quick-info",
          title: "Medical Alert",
          description: "Allergic to peanuts - carries EpiPen",
          date: new Date(),
        },
        {
          id: "4",
          category: "daily-support",
          title: "Sensory Needs",
          description:
            "Calms down with deep pressure, sensitive to loud noises",
          date: new Date(),
        },
        {
          id: "5",
          category: "daily-support",
          title: "Daily Routine",
          description:
            "Loves trains and dinosaurs, needs structure for transitions",
          date: new Date(),
        },
        {
          id: "6",
          category: "daily-support",
          title: "Comfort Items",
          description:
            "Blue weighted blanket and dinosaur stuffed animal help with anxiety",
          date: new Date(),
        },
        {
          id: "7",
          category: "health-therapy",
          title: "Medications",
          description: "Melatonin 3mg at bedtime for sleep",
          date: new Date(),
        },
        {
          id: "8",
          category: "health-therapy",
          title: "Therapy Schedule",
          description: "Speech therapy Tuesdays, OT Thursdays at 3pm",
          date: new Date(),
        },
        {
          id: "9",
          category: "education-goals",
          title: "IEP Goals",
          description:
            "Working on 2-word phrases and following 2-step directions",
          date: new Date(),
        },
        {
          id: "10",
          category: "education-goals",
          title: "Learning Style",
          description:
            "Visual learner - responds well to picture cards and demonstrations",
          date: new Date(),
        },
        {
          id: "11",
          category: "behavior-social",
          title: "Triggers",
          description:
            "Loud unexpected noises, changes in routine without warning",
          date: new Date(),
        },
        {
          id: "12",
          category: "behavior-social",
          title: "Social Preferences",
          description: "Prefers parallel play, working on turn-taking skills",
          date: new Date(),
        },
        {
          id: "13",
          category: "family-resources",
          title: "Support Team",
          description:
            "Dr. Martinez (pediatrician), Ms. Johnson (special ed teacher)",
          date: new Date(),
        },
        {
          id: "14",
          category: "family-resources",
          title: "Helpful Resources",
          description:
            "Local autism support group meets first Saturday of each month",
          date: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // This path is only for navigation usage, not App.js usage
    // Save using StorageService
    await StorageService.saveProfile(demoProfile);
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      padding: 20,
      alignItems: "center",
      paddingTop: Platform.OS === "web" ? 60 : 40,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: "center",
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    infoBox: {
      backgroundColor: colors.background.secondary,
      padding: 15,
      borderRadius: 10,
      marginBottom: 30,
      width: "100%",
      maxWidth: 400,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 10,
    },
    infoText: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 12,
      width: "100%",
      maxWidth: 400,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonOutline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    buttonTextOutline: {
      color: colors.primary,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
      width: "100%",
      maxWidth: 400,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 10,
      color: colors.text.secondary,
      fontSize: 14,
    },
    inputContainer: {
      width: "100%",
      maxWidth: 400,
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 15,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.secondary,
      marginBottom: 10,
    },
    // Child info step styles
    stepHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      maxWidth: 400,
      marginBottom: 20,
    },
    backButton: {
      padding: 10,
    },
    backText: {
      fontSize: 24,
      color: colors.text.primary,
    },
    stepTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
    },
    photoSection: {
      alignItems: "center",
      marginBottom: 30,
    },
    photoButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.background.secondary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: colors.border,
      marginBottom: 10,
    },
    photoButtonSelected: {
      borderColor: colors.primary,
      borderStyle: "solid",
      backgroundColor: colors.background.paper,
    },
    photoIcon: {
      fontSize: 40,
    },
    photoLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    formSection: {
      width: "100%",
      maxWidth: 400,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    helpText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 10,
      marginBottom: 20,
    },
    dateHint: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: -5,
      marginBottom: 10,
      fontStyle: "italic",
    },
    photoImage: {
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    inputText: {
      color: colors.text.primary,
      fontSize: 16,
    },
    placeholderText: {
      color: colors.text.disabled,
      fontSize: 16,
    },
    clearPhotoButton: {
      marginTop: 5,
    },
    clearPhotoText: {
      color: colors.primary,
      fontSize: 14,
    },
    errorText: {
      color: colors.error || "#f44336",
      fontSize: 14,
      marginTop: 5,
      marginBottom: 10,
      textAlign: "center",
    },
    loadingText: {
      color: colors.text.secondary,
      fontSize: 14,
      fontStyle: "italic",
    },
  });

  const ScrollComponent = Platform.OS === "web" ? View : ScrollView;

  // Render child info step
  if (step === 1) {
    return (
      <ScrollComponent
        {...(Platform.OS !== "web" ? getScrollViewProps() : {})}
        style={styles.container}
      >
        <View style={styles.scrollContent}>
          <View style={styles.stepHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(0)}
            >
              <CloseIcon size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.stepTitle}>Child Information</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={styles.subtitle}>
            Let's set up a profile for your child
          </Text>

          <View style={styles.photoSection}>
            <TouchableOpacity
              style={[styles.photoButton, photo && styles.photoButtonSelected]}
              onPress={handlePhotoPicker}
              activeOpacity={0.7}
              disabled={isProcessingPhoto}
            >
              {isProcessingPhoto ? (
                <Text style={styles.loadingText}>Processing...</Text>
              ) : photo ? (
                <Image
                  source={{
                    uri:
                      Platform.OS === "ios" && photo.startsWith("/")
                        ? `https://manylla.com/qual${photo}` // Convert relative path to absolute URL for iOS
                        : photo,
                  }}
                  style={styles.photoImage}
                />
              ) : (
                <PersonIcon size={40} color={colors.text.secondary} />
              )}
            </TouchableOpacity>
            <Text style={styles.photoLabel}>
              {isProcessingPhoto
                ? "Processing photo..."
                : photo
                  ? "Photo selected"
                  : "Tap to add photo"}
            </Text>
            {photo && !isProcessingPhoto && (
              <TouchableOpacity
                onPress={() => {
                  setPhoto(null);
                  setErrorMessage("");
                }}
                style={styles.clearPhotoButton}
              >
                <Text style={styles.clearPhotoText}>Clear photo</Text>
              </TouchableOpacity>
            )}
            {Platform.OS !== "web" && (
              <Text style={styles.dateHint}>
                Photo selection coming soon for mobile
              </Text>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Child's Name *</Text>
            <TextInput
              style={[
                styles.input,
                getTextStyle("input"),
                Platform.OS === "android" && { color: "#000000" },
              ]}
              placeholder="Enter name"
              placeholderTextColor={
                Platform.OS === "android" ? "#999" : colors.text.disabled
              }
              value={childName}
              onChangeText={setChildName}
              autoFocus={Platform.OS === "web"}
            />

            <Text style={styles.label}>Date of Birth</Text>
            {Platform.OS === "web" ? (
              <input
                type="date"
                className="date-input"
                style={{
                  padding: "12px 15px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  width: "auto",
                  alignSelf: "stretch",
                  marginBottom: 15,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                }}
                value={dateOfBirth}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            ) : (
              <TextInput
                style={[
                  styles.input,
                  getTextStyle("input"),
                  Platform.OS === "android" && { color: "#000000" },
                ]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={
                  Platform.OS === "android" ? "#999" : colors.text.disabled
                }
                value={dateOfBirth}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
                autoComplete="off"
              />
            )}
            {Platform.OS !== "web" && dateOfBirth.length === 0 && (
              <Text style={styles.dateHint}>
                Type numbers and slashes will be added automatically
              </Text>
            )}

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
              <Text style={styles.helpText}>
                You can always add more details later
              </Text>
            )}

            <TouchableOpacity
              style={[styles.button, !childName.trim() && { opacity: 0.5 }]}
              onPress={handleChildInfoSubmit}
              disabled={!childName.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollComponent>
    );
  }

  // Render welcome step (step 0)
  return (
    <ScrollComponent
      {...(Platform.OS !== "web" ? getScrollViewProps() : {})}
      style={styles.container}
    >
      <View style={styles.scrollContent}>
        <View style={styles.logo}>
          <MenuIcon size={60} color={colors.primary} />
        </View>

        <Text style={styles.title}>Welcome to manylla</Text>
        <Text style={styles.subtitle}>
          Your secure companion for managing your child's special needs journey
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>manylla helps you:</Text>
          <Text style={styles.infoText}>
            • Track developmental milestones{"\n"}• Organize IEP goals and
            medical records{"\n"}• Share information securely{"\n"}• Sync across
            all your devices
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleStartFresh}
          activeOpacity={0.8}
        >
          <AddIcon size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Start Fresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={handleDemoMode}
          activeOpacity={0.8}
        >
          <MenuIcon size={24} color={colors.primary} />
          <Text style={[styles.buttonText, styles.buttonTextOutline]}>
            Try Demo Mode
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              getTextStyle("input"),
              Platform.OS === "android" && { color: "#000000" },
            ]}
            placeholder="Enter access code"
            placeholderTextColor={
              Platform.OS === "android" ? "#999" : colors.text.disabled
            }
            value={accessCode}
            onChangeText={setAccessCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, !accessCode && { opacity: 0.5 }]}
            onPress={() => accessCode && handleJoinWithCode(accessCode)}
            disabled={!accessCode}
            activeOpacity={0.8}
          >
            <ShareIcon size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Join with Access Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollComponent>
  );
};

export default OnboardingScreen;
