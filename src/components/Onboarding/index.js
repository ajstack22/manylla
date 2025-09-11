// Export a simplified wrapper for backward compatibility with App.js
// The actual onboarding screen is in screens/Onboarding/OnboardingScreen.js
// This just provides the UI component that App.js expects

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { AddIcon, PersonIcon, ShareIcon, MenuIcon, CloseIcon } from "../Common";

export const OnboardingWizard = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [accessCode, setAccessCode] = useState("");
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [photo, setPhoto] = useState("");
  const { colors } = useTheme();

  const handleStartFresh = () => {
    setStep(1); // Go to child info page
  };

  const handleChildInfoSubmit = () => {
    if (!childName.trim()) {
      if (Platform.OS === "web") {
        alert("Please enter the child's name");
      }
      return;
    }

    onComplete({
      mode: "fresh",
      childName: childName.trim(),
      dateOfBirth: dateOfBirth || undefined,
      photo: photo || undefined,
    });
  };

  const handleDemoMode = () => {
    onComplete({
      mode: "demo",
    });
  };

  const handleJoinWithCode = () => {
    if (accessCode) {
      onComplete({
        mode: "join",
        accessCode,
      });
    }
  };

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
              style={styles.photoButton}
              onPress={() => setPhoto("default")}
            >
              <PersonIcon size={40} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Tap to add photo</Text>
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
              onChangeText={setDateOfBirth}
            />

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
            onPress={handleJoinWithCode}
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
