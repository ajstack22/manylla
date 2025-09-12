import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { useTheme } from "../../context/ThemeContext";
import { defaultCategories } from "../../utils/defaultCategories";
import { defaultQuickInfoPanels } from "../../utils/defaultQuickInfo";
import { DatePicker } from "../DatePicker/DatePicker";
import { getTextStyle, getScrollViewProps } from "../../utils/platformStyles";
import platform from "@platform";

export const ProfileCreateDialog = ({ open, onClose, onCreate }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    preferredName: "",
    dateOfBirth: new Date(),
    pronouns: "",
    photo: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");

  const steps = ["Basic Info", "Photo"];

  const handlePhotoChange = () => {
    if (platform.isWeb) {
      // Web file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            setPhotoPreview(result);
            setFormData({ ...formData, photo: result });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // React Native image picker
      const options = {
        mediaType: "photo",
        includeBase64: true,
        maxHeight: 500,
        maxWidth: 500,
      };

      launchImageLibrary(options, (response) => {
        if (response.assets && response.assets[0]) {
          const base64 = `data:${response.assets[0].type};base64,${response.assets[0].base64}`;
          setPhotoPreview(base64);
          setFormData({ ...formData, photo: base64 });
        }
      });
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Create the profile
      const newProfile = {
        id: Date.now().toString(),
        ...formData,
        entries: [],
        categories: defaultCategories,
        quickInfoPanels: defaultQuickInfoPanels,
        themeMode: "light",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      onCreate(newProfile);
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const canProceed = () => {
    if (activeStep === 0) {
      return formData.name.trim() !== "";
    }
    return true;
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.stepDot,
              index === activeStep && styles.stepDotActive,
              index < activeStep && styles.stepDotCompleted,
            ]}
          >
            {index < activeStep ? (
              <Text style={styles.stepCheckmark}>✓</Text>
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              index === activeStep && styles.stepLabelActive,
            ]}
          >
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.formSection}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Child's Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter full name"
          placeholderTextColor={colors.text.secondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Preferred Name (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.preferredName}
          onChangeText={(text) =>
            setFormData({ ...formData, preferredName: text })
          }
          placeholder="What they like to be called"
          placeholderTextColor={colors.text.secondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <DatePicker
          value={formData.dateOfBirth}
          onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
          style={styles.datePicker}
        />
        <Text style={styles.helperText}>
          Age: {calculateAge(formData.dateOfBirth)} years
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pronouns (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.pronouns}
          onChangeText={(text) => setFormData({ ...formData, pronouns: text })}
          placeholder="e.g., she/her, he/him, they/them"
          placeholderTextColor={colors.text.secondary}
        />
      </View>
    </View>
  );

  const renderPhotoStep = () => (
    <View style={styles.photoSection}>
      <Text style={styles.photoDescription}>
        Add a photo to personalize the profile (optional)
      </Text>

      <View style={styles.photoContainer}>
        {photoPreview ? (
          <Image
            source={{
              uri:
                platform.isIOS && photoPreview.startsWith("/")
                  ? `https://manylla.com/qual${photoPreview}` // Convert relative path to absolute URL for iOS
                  : photoPreview,
            }}
            style={styles.photoPreview}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>
              {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.photoButton}
          onPress={handlePhotoChange}
        >
          <Text style={styles.photoButtonIcon}>📷</Text>
          <Text style={styles.photoButtonText}>
            {photoPreview ? "Change Photo" : "Add Photo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeStep === 0 ? renderBasicInfo() : renderPhotoStep()}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {activeStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              !canProceed() && styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.primaryButtonText}>
              {activeStep === steps.length - 1 ? "Create Profile" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.background.paper,
      flex: 1,
      textAlign: "center",
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 20,
      color: colors.background.paper,
    },
    headerSpacer: {
      width: 36,
    },
    stepIndicator: {
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 24,
      paddingHorizontal: 16,
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stepContainer: {
      alignItems: "center",
      marginHorizontal: 24,
    },
    stepDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    stepDotActive: {
      backgroundColor: colors.primary,
    },
    stepDotCompleted: {
      backgroundColor: colors.success.main,
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    stepCheckmark: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background.paper,
    },
    stepLabel: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    stepLabelActive: {
      color: colors.primary,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      padding: 16,
    },
    formSection: {
      paddingVertical: 8,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.paper,
    },
    datePicker: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: colors.background.paper,
    },
    helperText: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
    },
    photoSection: {
      alignItems: "center",
      paddingVertical: 24,
    },
    photoDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: "center",
      marginBottom: 24,
    },
    photoContainer: {
      alignItems: "center",
    },
    photoPreview: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 16,
    },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    photoPlaceholderText: {
      fontSize: 48,
      fontWeight: "600",
      color: colors.background.paper,
    },
    photoButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      backgroundColor: colors.background.paper,
    },
    photoButtonIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    photoButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    actions: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background.paper,
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
    },
    backButton: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background.paper,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
