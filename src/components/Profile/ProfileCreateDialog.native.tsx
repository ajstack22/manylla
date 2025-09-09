import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { ChildProfile } from '../../types/ChildProfile';
import { defaultCategories } from '../../utils/defaultCategories';
import { defaultQuickInfoPanels } from '../../utils/defaultQuickInfo';

interface ProfileCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (profile: ChildProfile) => void;
}

export const ProfileCreateDialog: React.FC<ProfileCreateDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    preferredName: '',
    dateOfBirth: new Date(),
    pronouns: '',
    photo: '',
  });
  
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const steps = ['Basic Info', 'Photo'];

  const handlePhotoChange = () => {
    const options = {
      mediaType: 'photo' as const,
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

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Create the profile
      const newProfile: ChildProfile = {
        id: Date.now().toString(),
        ...formData,
        entries: [],
        categories: defaultCategories,
        quickInfoPanels: defaultQuickInfoPanels,
        themeMode: 'light',
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
      return formData.name.trim() !== '';
    }
    return true;
  };

  const calculateAge = (dob: Date) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Basic Information</Text>
          <Text style={styles.stepDescription}>
            Let's start with some basic information about your child
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Child's Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter full name"
              placeholderTextColor="#999"
              autoFocus
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preferred Name</Text>
            <TextInput
              style={styles.input}
              value={formData.preferredName}
              onChangeText={(text) => setFormData({ ...formData, preferredName: text })}
              placeholder="What they like to be called"
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>Optional</Text>
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
              onChangeText={(text) => setFormData({ ...formData, pronouns: text })}
              placeholder="e.g., she/her, he/him, they/them"
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>Optional</Text>
          </View>
        </View>
      );
    }

    if (activeStep === 1) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Profile Photo</Text>
          <Text style={styles.stepDescription}>
            Add a photo to personalize the profile (optional)
          </Text>
          
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              {photoPreview ? (
                <Image source={{ uri: photoPreview }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {formData.name.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handlePhotoChange}
            >
              <Text style={styles.photoButtonText}>
                {photoPreview ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
            
            {photoPreview && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  setPhotoPreview('');
                  setFormData({ ...formData, photo: '' });
                }}
              >
                <Text style={styles.skipButtonText}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return null;
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
          <Text style={styles.headerTitle}>Create Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {steps.map((step, index) => (
            <View key={step} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                index <= activeStep && styles.stepCircleActive
              ]}>
                <Text style={[
                  styles.stepNumber,
                  index <= activeStep && styles.stepNumberActive
                ]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[
                styles.stepLabel,
                index <= activeStep && styles.stepLabelActive
              ]}>
                {step}
              </Text>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  index < activeStep && styles.stepLineActive
                ]} />
              )}
            </View>
          ))}
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>
        
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {activeStep > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>
                {activeStep === steps.length - 1 ? 'Create Profile' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'android');
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  headerSpacer: {
    width: 60,
  },
  stepIndicator: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#8B7355',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#999',
  },
  stepLabelActive: {
    color: '#8B7355',
    fontWeight: '600',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E0E0E0',
    zIndex: -1,
  },
  stepLineActive: {
    backgroundColor: '#8B7355',
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dateIcon: {
    fontSize: 18,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  photoSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 56,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  photoButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8B7355',
    borderRadius: 8,
    marginBottom: 12,
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#8B7355',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#8B7355',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#8B7355',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});