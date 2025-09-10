import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  Alert,
} from "react-native";

const { width } = Dimensions.get("window");

export const ProgressiveOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState("welcome");
  const [mode, setMode] = useState(null);
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [photo, setPhoto] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [nameError, setNameError] = useState(false);

  // Always use Manylla theme colors for onboarding
  const manyllaColors = {
    background: "#C4A66B", // Actual manila envelope color
    paper: "#D4B896", // Lighter manila for cards
    text: "#3D2F1F", // Dark brown text
    textSecondary: "#5D4A37", // Medium brown for secondary text
    border: "#A68B5B", // Darker manila for borders
    primary: "#8B7355", // Medium brown for primary actions
    primaryDark: "#6B5745", // Darker brown for hover states
  };

  const handleNext = () => {
    const stepOrder = [
      "welcome",
      "choose-path",
      "child-info",
      "privacy",
      "ready",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      // Skip child-info if demo mode or join mode
      if (
        (mode === "demo" || mode === "join") &&
        stepOrder[currentIndex + 1] === "child-info"
      ) {
        setCurrentStep(stepOrder[currentIndex + 2]);
      } else {
        setCurrentStep(stepOrder[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const stepOrder = [
      "welcome",
      "choose-path",
      "child-info",
      "privacy",
      "ready",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      // Skip child-info if demo mode or join mode when going back
      if (
        (mode === "demo" || mode === "join") &&
        stepOrder[currentIndex - 1] === "child-info"
      ) {
        setCurrentStep(stepOrder[currentIndex - 2]);
      } else {
        setCurrentStep(stepOrder[currentIndex - 1]);
      }
    }
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === "join") {
      setShowAccessCode(true);
    } else if (selectedMode === "demo") {
      // For demo mode, skip directly to privacy step
      setCurrentStep("privacy");
    } else {
      // For fresh mode, go to child-info step
      setCurrentStep("child-info");
    }
  };

  const handleJoinWithCode = () => {
    if (accessCode.length === 6) {
      setMode("join");
      setCurrentStep("privacy"); // Skip directly to privacy step for join mode
    }
  };

  const handleFinish = () => {
    onComplete({
      childName: mode === "demo" ? "Ellie" : childName,
      dateOfBirth: mode === "demo" ? undefined : dateOfBirth || undefined,
      photo: mode === "demo" ? "" : photo,
      mode: mode || "fresh",
      accessCode: mode === "join" ? accessCode : undefined,
    });
  };

  const getStepNumber = () => {
    if (mode === "demo" || mode === "join") {
      switch (currentStep) {
        case "welcome":
          return 0;
        case "choose-path":
          return 1;
        case "privacy":
          return 2;
        case "ready":
          return 3;
        default:
          return 0;
      }
    }
    switch (currentStep) {
      case "welcome":
        return 0;
      case "choose-path":
        return 1;
      case "child-info":
        return 2;
      case "privacy":
        return 3;
      case "ready":
        return 4;
      default:
        return 0;
    }
  };

  const getTotalSteps = () => (mode === "demo" || mode === "join" ? 4 : 5);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: manyllaColors.background,
      paddingVertical: 32,
    },
    scrollContainer: {
      paddingHorizontal: 16,
      maxWidth: Platform.OS === "web" ? 480 : width,
      alignSelf: "center",
      width: "100%",
    },
    progressContainer: {
      marginBottom: 24,
    },
    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    progressText: {
      fontSize: 12,
      color: manyllaColors.textSecondary,
    },
    backButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      fontSize: 18,
      color: manyllaColors.text,
    },
    progressBar: {
      width: "100%",
      height: 2,
      backgroundColor: manyllaColors.border,
      borderRadius: 8,
    },
    progressFill: {
      height: "100%",
      backgroundColor: manyllaColors.primary,
      borderRadius: 8,
    },
    card: {
      backgroundColor: manyllaColors.paper,
      borderRadius: 8,
      padding: 24,
      borderWidth: 1,
      borderColor: manyllaColors.border,
    },
    centerText: {
      textAlign: "center",
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 16,
    },
    logo: {
      fontSize: 48,
      fontWeight: "600",
      color: manyllaColors.primary,
      letterSpacing: -2,
      lineHeight: 48,
    },
    title: {
      fontSize: 24,
      fontWeight: "600",
      color: manyllaColors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: manyllaColors.textSecondary,
      marginBottom: 16,
    },
    featureContainer: {
      backgroundColor: manyllaColors.background,
      borderRadius: 8,
      padding: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: manyllaColors.border,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
    },
    featureIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    featureIconText: {
      fontSize: 12,
      color: "white",
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: manyllaColors.text,
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 14,
      color: manyllaColors.textSecondary,
    },
    button: {
      backgroundColor: manyllaColors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "500",
      color: "white",
    },
    optionCard: {
      backgroundColor: manyllaColors.paper,
      borderRadius: 8,
      padding: 24,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: manyllaColors.border,
    },
    optionSelected: {
      borderColor: manyllaColors.primary,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    optionIcon: {
      fontSize: 20,
      marginRight: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: manyllaColors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: manyllaColors.textSecondary,
    },
    codeInput: {
      flexDirection: "row",
      marginTop: 16,
    },
    textInput: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 8,
      fontSize: 16,
      color: manyllaColors.text,
    },
    codeButton: {
      backgroundColor: manyllaColors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    infoAlert: {
      backgroundColor: manyllaColors.background,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: manyllaColors.border,
      marginBottom: 16,
    },
    infoText: {
      fontSize: 14,
      color: manyllaColors.text,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Step {getStepNumber() + 1} of {getTotalSteps()}
            </Text>
            {currentStep !== "welcome" && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((getStepNumber() + 1) / getTotalSteps()) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Step Content */}
        <View style={styles.card}>
          {currentStep === "welcome" && (
            <View>
              <View style={[styles.logoContainer, styles.centerText]}>
                <Text style={styles.logo}>manylla</Text>
              </View>
              <Text style={[styles.title, styles.centerText]}>
                Welcome! Let's get started
              </Text>
              <Text style={[styles.subtitle, styles.centerText]}>
                Your secure companion for managing your child's special needs
                journey
              </Text>

              <View style={styles.featureContainer}>
                <View style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: manyllaColors.primary },
                    ]}
                  >
                    <Text style={styles.featureIconText}>🔒</Text>
                  </View>
                  <View>
                    <Text style={styles.featureTitle}>Private & Secure</Text>
                    <Text style={styles.featureDescription}>
                      Your data never leaves your device without encryption
                    </Text>
                  </View>
                </View>

                <View style={styles.featureRow}>
                  <View
                    style={[styles.featureIcon, { backgroundColor: "#7B9EA8" }]}
                  >
                    <Text style={styles.featureIconText}>☁️</Text>
                  </View>
                  <View>
                    <Text style={styles.featureTitle}>Multi-device Sync</Text>
                    <Text style={styles.featureDescription}>
                      Access from anywhere with your recovery phrase
                    </Text>
                  </View>
                </View>

                <View style={styles.featureRow}>
                  <View
                    style={[styles.featureIcon, { backgroundColor: "#8B9467" }]}
                  >
                    <Text style={styles.featureIconText}>📤</Text>
                  </View>
                  <View>
                    <Text style={styles.featureTitle}>Controlled Sharing</Text>
                    <Text style={styles.featureDescription}>
                      Share only what you want, when you want
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === "choose-path" && (
            <View>
              <Text style={[styles.title, styles.centerText]}>
                How would you like to begin?
              </Text>
              <Text style={[styles.subtitle, styles.centerText]}>
                You can always change this later
              </Text>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  mode === "fresh" && styles.optionSelected,
                ]}
                onPress={() => handleModeSelect("fresh")}
              >
                <View style={styles.optionRow}>
                  <Text
                    style={[
                      styles.optionIcon,
                      { color: manyllaColors.primary },
                    ]}
                  >
                    ➕
                  </Text>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Start Fresh</Text>
                    <Text style={styles.optionDescription}>
                      Create a new profile for your child
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  mode === "demo" && styles.optionSelected,
                ]}
                onPress={() => handleModeSelect("demo")}
              >
                <View style={styles.optionRow}>
                  <Text style={[styles.optionIcon, { color: "#8B9467" }]}>
                    ▶️
                  </Text>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Try Demo</Text>
                    <Text style={styles.optionDescription}>
                      Explore with Ellie's example profile
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  showAccessCode && styles.optionSelected,
                ]}
                onPress={() => setShowAccessCode(!showAccessCode)}
              >
                <View style={styles.optionRow}>
                  <Text
                    style={[
                      styles.optionIcon,
                      { color: manyllaColors.textSecondary },
                    ]}
                  >
                    📤
                  </Text>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Join with Code</Text>
                    <Text style={styles.optionDescription}>
                      Connect to an existing shared profile
                    </Text>
                  </View>
                </View>

                {showAccessCode && (
                  <View style={styles.codeInput}>
                    <TextInput
                      style={styles.textInput}
                      value={accessCode}
                      onChangeText={(text) => setAccessCode(text.toUpperCase())}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={[
                        styles.codeButton,
                        accessCode.length !== 6 && { opacity: 0.5 },
                      ]}
                      onPress={handleJoinWithCode}
                      disabled={accessCode.length !== 6}
                    >
                      <Text style={styles.buttonText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {currentStep === "privacy" && (
            <View>
              <Text style={[styles.title, styles.centerText]}>
                Your Privacy Matters
              </Text>

              <View style={[styles.optionCard, { borderColor: "#8B9467" }]}>
                <View style={styles.optionRow}>
                  <Text style={[styles.optionIcon, { color: "#8B9467" }]}>
                    ✅
                  </Text>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>
                      Zero-Knowledge Encryption
                    </Text>
                    <Text style={styles.optionDescription}>
                      Your data is encrypted on your device. We never see it.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.optionCard, { borderColor: "#7B9EA8" }]}>
                <View style={styles.optionRow}>
                  <Text style={[styles.optionIcon, { color: "#7B9EA8" }]}>
                    ✅
                  </Text>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>No Account Required</Text>
                    <Text style={styles.optionDescription}>
                      No emails, no passwords, no tracking. Just a recovery
                      phrase.
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.optionCard,
                  { borderColor: manyllaColors.primary },
                ]}
              >
                <View style={styles.optionRow}>
                  <Text
                    style={[
                      styles.optionIcon,
                      { color: manyllaColors.primary },
                    ]}
                  >
                    ✅
                  </Text>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>You Control Sharing</Text>
                    <Text style={styles.optionDescription}>
                      Share specific information with time limits and access
                      codes.
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>I Understand</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === "ready" && (
            <View>
              <View style={styles.centerText}>
                <View
                  style={[
                    styles.featureIcon,
                    {
                      backgroundColor: "#8B9467",
                      alignSelf: "center",
                      marginBottom: 16,
                    },
                  ]}
                >
                  <Text style={styles.featureIconText}>✅</Text>
                </View>

                <Text style={styles.title}>
                  {mode === "demo" ? "Ready to Explore!" : "All Set!"}
                </Text>
                <Text style={styles.subtitle}>
                  {mode === "demo"
                    ? "You'll be using Ellie's example profile to explore manylla"
                    : `Let's start building ${childName || "your child"}'s profile`}
                </Text>

                <View style={styles.infoAlert}>
                  <Text style={[styles.featureTitle, { marginBottom: 8 }]}>
                    Quick tips to get started:
                  </Text>
                  <Text style={styles.infoText}>
                    • Add important information in Quick Info{"\n"}• Track
                    progress with Goals and Successes{"\n"}• Enable sync to
                    access from other devices
                  </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleFinish}>
                  <Text style={styles.buttonText}>
                    {mode === "demo" ? "Start Demo" : "Start Using manylla"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
