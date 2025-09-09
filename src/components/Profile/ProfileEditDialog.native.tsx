import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  launchImageLibrary,
  ImagePickerResponse,
} from "react-native-image-picker";
import { ChildProfile } from "../../types/ChildProfile";

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  profile: ChildProfile;
  onSave: (updates: Partial<ChildProfile>) => void;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  open,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    preferredName: profile.preferredName,
    dateOfBirth: profile.dateOfBirth,
    pronouns: profile.pronouns,
    photo: profile.photo,
  });

  const [photoPreview, setPhotoPreview] = useState<string>(profile.photo || "");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePhotoChange = () => {
    const options = {
      mediaType: "photo" as const,
      includeBase64: true,
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.base64) {
          const base64Image = `data:${asset.type};base64,${asset.base64}`;
          setPhotoPreview(base64Image);
          setFormData({ ...formData, photo: base64Image });
        }
      }
    });
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove the profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setPhotoPreview("");
            setFormData({ ...formData, photo: "" });
          },
        },
      ],
    );
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Full name is required");
      return;
    }

    onSave({
      ...formData,
      updatedAt: new Date(),
    });
    onClose();
  };

  const calculateAge = (dob: Date) => {
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

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              {photoPreview ? (
                <Image source={{ uri: photoPreview }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {formData.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePhotoChange}
              >
                <Text style={styles.photoButtonText}>
                  {photoPreview ? "Change Photo" : "Add Photo"}
                </Text>
              </TouchableOpacity>
              {photoPreview && (
                <TouchableOpacity
                  style={[styles.photoButton, styles.removePhotoButton]}
                  onPress={handleRemovePhoto}
                >
                  <Text style={styles.removePhotoButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Name</Text>
              <TextInput
                style={styles.input}
                value={formData.preferredName}
                onChangeText={(text) =>
                  setFormData({ ...formData, preferredName: text })
                }
                placeholder="What they like to be called"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formatDate(formData.dateOfBirth)}
                </Text>
                <Text style={styles.dateIcon}>📅</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Age: {calculateAge(formData.dateOfBirth)} years
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pronouns</Text>
              <TextInput
                style={styles.input}
                value={formData.pronouns}
                onChangeText={(text) =>
                  setFormData({ ...formData, pronouns: text })
                }
                placeholder="e.g., she/her, he/him, they/them"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "android");
              if (selectedDate) {
                setFormData({ ...formData, dateOfBirth: selectedDate });
              }
            }}
            maximumDate={new Date()}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#8B7355",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  photoSection: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: "#8B7355",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#8B7355",
    borderRadius: 8,
  },
  photoButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  removePhotoButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  removePhotoButtonText: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "600",
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  dateInput: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  dateIcon: {
    fontSize: 18,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
});
