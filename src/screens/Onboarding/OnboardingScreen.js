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
} from "react-native";

// Third-party libraries
import AsyncStorage from "@react-native-async-storage/async-storage";

// Context/Hooks
import { useTheme } from "../../context/ThemeContext";

// Components
import {
  AddIcon,
  PersonIcon,
  ShareIcon,
  MenuIcon,
  CloseIcon,
} from "../../components/Common";

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
  const [photo, setPhoto] = useState("");

  // Format date input with automatic slashes
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

  const handleDateChange = (text) => {
    // Only allow numbers and forward slashes
    const formatted = formatDateInput(text);
    setDateOfBirth(formatted);
  };

  const handleStartFresh = () => {
    setStep(1); // Go to child info page
  };

  const handleChildInfoSubmit = async () => {
    if (!childName.trim()) {
      if (Platform.OS === "web") {
        alert("Please enter the child's name");
      }
      return;
    }

    // If onComplete prop provided (App.js usage), just return the data
    if (onComplete) {
      onComplete({
        mode: "fresh",
        childName: childName.trim(),
        dateOfBirth: dateOfBirth || undefined,
        photo: photo || undefined,
      });
      return;
    }

    // Otherwise handle profile creation directly (navigation usage)
    const newProfile = {
      id: Date.now().toString(),
      name: childName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
      photo: photo || undefined,
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
      photo: "/ellie.png",
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
  });

  const ScrollComponent = Platform.OS === "web" ? View : ScrollView;

  // Render child info step
  if (step === 1) {
    return (
      <ScrollComponent style={styles.container}>
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
              onPress={() => {
                setPhoto(photo ? "" : null);
                if (Platform.OS === "web") {
                  // Provide feedback for web users
                  console.log("Photo selection toggled");
                }
              }}
              activeOpacity={0.7}
            >
              <PersonIcon
                size={40}
                color={photo ? colors.primary : colors.text.secondary}
              />
            </TouchableOpacity>
            <Text style={styles.photoLabel}>
              {photo ? "Photo selected" : "Tap to add photo"}
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Child's Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={colors.text.disabled}
              value={childName}
              onChangeText={setChildName}
              autoFocus={Platform.OS === "web"}
            />

            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={colors.text.disabled}
              value={dateOfBirth}
              onChangeText={handleDateChange}
              keyboardType={Platform.OS === "web" ? "default" : "numeric"}
              maxLength={10}
              autoComplete="off"
            />
            {Platform.OS === "web" && dateOfBirth.length === 0 && (
              <Text style={styles.dateHint}>
                Type numbers and slashes will be added automatically
              </Text>
            )}

            <Text style={styles.helpText}>
              You can always add more details later
            </Text>

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
    <ScrollComponent style={styles.container}>
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
            style={styles.input}
            placeholder="Enter access code"
            placeholderTextColor={colors.text.disabled}
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
