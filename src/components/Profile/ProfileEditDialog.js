import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Modal,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "react-native-image-picker";
import { useTheme } from "../../context/ThemeContext";

export const ProfileEditDialog = ({ open, onClose, profile, onSave }) => {
  const { colors } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    preferredName: profile?.preferredName || "",
    dateOfBirth: profile?.dateOfBirth
      ? new Date(profile.dateOfBirth)
      : new Date(),
    pronouns: profile?.pronouns || "",
    photo: profile?.photo || "",
  });

  const [photoPreview, setPhotoPreview] = useState(profile?.photo || "");

  const handlePhotoSelect = () => {
    if (Platform.OS === "web") {
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
      // Mobile image picker
      Alert.alert(
        "Select Photo",
        "Choose from where you want to select an image",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Take Photo",
            onPress: () => launchCamera(),
          },
          {
            text: "Choose from Gallery",
            onPress: () => launchImageLibrary(),
          },
        ],
      );
    }
  };

  const launchCamera = () => {
    const options = {
      mediaType: "photo",
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        // User cancelled camera - no logging needed
      } else if (response.error) {
      } else {
        const imageUri = `data:${response.type};base64,${response.base64}`;
        setPhotoPreview(imageUri);
        setFormData({ ...formData, photo: imageUri });
      }
    });
  };

  const launchImageLibrary = () => {
    const options = {
      mediaType: "photo",
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        // User cancelled image picker - no logging needed
      } else if (response.error) {
      } else {
        const imageUri = `data:${response.type};base64,${response.base64}`;
        setPhotoPreview(imageUri);
        setFormData({ ...formData, photo: imageUri });
      }
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    onSave({
      ...formData,
      updatedAt: new Date(),
    });
    onClose();
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

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const styles = getStyles(colors);

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Profile Photo */}
            <View style={styles.photoSection}>
              <View style={styles.avatarContainer}>
                {photoPreview ? (
                  <Image source={{ uri: photoPreview }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon
                      name="person"
                      size={50}
                      color={colors.text.secondary}
                    />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePhotoSelect}
              >
                <Icon name="photo-camera" size={20} color={colors.primary} />
                <Text style={styles.photoButtonText}>
                  {photoPreview ? "Change Photo" : "Add Photo"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.formField}>
              <Text style={styles.modalLabel}>Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={formData.name}
                onChangeText={(value) =>
                  setFormData({ ...formData, name: value })
                }
                placeholder="Enter name"
                placeholderTextColor={colors.text.disabled}
              />
            </View>

            {/* Preferred Name */}
            <View style={styles.formField}>
              <Text style={styles.modalLabel}>Preferred Name</Text>
              <TextInput
                style={styles.modalInput}
                value={formData.preferredName}
                onChangeText={(value) =>
                  setFormData({ ...formData, preferredName: value })
                }
                placeholder="Enter preferred name (optional)"
                placeholderTextColor={colors.text.disabled}
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.formField}>
              <Text style={styles.modalLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar-today" size={20} color={colors.primary} />
                <Text style={styles.datePickerText}>
                  {formatDate(formData.dateOfBirth)}
                </Text>
                <Text style={styles.ageText}>
                  Age: {calculateAge(formData.dateOfBirth)} years
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.dateOfBirth}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      setFormData({ ...formData, dateOfBirth: selectedDate });
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Pronouns */}
            <View style={styles.formField}>
              <Text style={styles.modalLabel}>Pronouns</Text>
              <TextInput
                style={styles.modalInput}
                value={formData.pronouns}
                onChangeText={(value) =>
                  setFormData({ ...formData, pronouns: value })
                }
                placeholder="e.g., she/her, he/him, they/them"
                placeholderTextColor={colors.text.disabled}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    modalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: Platform.select({
        web: "rgba(0, 0, 0, 0.5)",
        ios: "rgba(0, 0, 0, 0.4)",
        android: "rgba(0, 0, 0, 0.5)",
      }),
      ...Platform.select({
        web: {
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        },
        default: {},
      }),
      zIndex: 999,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      maxWidth: Platform.select({
        web: 600,
        default: "90%",
      }),
      width: Platform.select({
        web: 600,
        default: "90%",
      }),
      maxHeight: Platform.select({
        web: "80vh",
        default: "80%",
      }),
      marginHorizontal: Platform.select({
        web: "auto",
        default: 20,
      }),
      ...Platform.select({
        web: {
          boxShadow: `0 10px 40px ${colors.primary}26`,
          border: `1px solid ${colors.border}`,
        },
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
      overflow: "hidden",
    },
    modalHeader: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: Platform.select({
        web: `${colors.primary}CC`,
        default: colors.primary,
      }),
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#FFFFFF",
      fontFamily: Platform.select({
        web: '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        default: "System",
      }),
      letterSpacing: 0.15,
    },
    modalCloseButton: {
      padding: 8,
      marginRight: -8,
      borderRadius: 20,
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "background-color 0.2s ease",
        },
        default: {},
      }),
    },
    modalBody: {
      padding: 20,
      backgroundColor: colors.background.paper,
      maxHeight: Platform.select({
        web: "calc(80vh - 140px)",
        default: "70%",
      }),
    },
    formField: {
      marginVertical: 12,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.secondary,
      marginBottom: 6,
      letterSpacing: 0.1,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      padding: 12,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.paper,
      ...Platform.select({
        web: {
          outline: "none",
          transition: "border-color 0.2s ease",
        },
        default: {},
      }),
    },
    photoSection: {
      alignItems: "center",
      marginBottom: 20,
    },
    avatarContainer: {
      marginBottom: 12,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: colors.border,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.background.manila,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.border,
    },
    photoButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
      gap: 8,
    },
    photoButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "500",
    },
    datePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      backgroundColor: colors.background.paper,
      gap: 8,
    },
    datePickerText: {
      fontSize: 16,
      color: colors.text.primary,
      flex: 1,
    },
    ageText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    modalFooter: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background.paper,
      gap: 12,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      minWidth: 100,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
        default: {},
      }),
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      minWidth: 100,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        web: {
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
        default: {},
      }),
    },
    secondaryButtonText: {
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: "500",
      letterSpacing: 0.3,
    },
  });
