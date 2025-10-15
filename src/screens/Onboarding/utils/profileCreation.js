import AsyncStorage from '@react-native-async-storage/async-storage';
import platform from '../../../utils/platform';
import { unifiedCategories } from '../../../utils/unifiedCategories';
import { StorageService } from '../../../services/storage/storageService';

// Import Ellie image for React Native
const EllieImage = !platform.isWeb
  ? require('../../../../public/assets/ellie.png')
  : null;

// Helper function to map category IDs to icons
const getIconForCategory = (categoryId) => {
  const iconMap = {
    'quick-info': 'info',
    'daily-support': 'support',
    'health-therapy': 'health',
    'education-goals': 'education',
    'behavior-social': 'social',
    'family-resources': 'family',
  };
  return iconMap[categoryId] || 'folder';
};

/**
 * Creates initial profile from form data
 */
export const createInitialProfile = (formData) => {
  return {
    id: Date.now().toString(),
    name: formData.childName.trim(),
    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date(),
    photo: formData.photo || null,
    categories: unifiedCategories.map((cat) => ({
      ...cat,
      icon: getIconForCategory(cat.id),
    })),
    entries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Creates demo profile with sample data
 */
export const createDemoProfile = () => {
  // Use a special marker that survives JSON stringification
  const DEMO_PHOTO_MARKER = '__DEMO_ELLIE__';

  return {
    id: 'demo-' + Date.now(),
    name: 'Ellie Thompson',
    preferredName: 'Ellie',
    pronouns: 'she/her',
    dateOfBirth: new Date('2018-06-15'),
    photo: DEMO_PHOTO_MARKER,
    categories: unifiedCategories.map((cat) => ({
      ...cat,
      icon: getIconForCategory(cat.id),
    })),
    entries: [
      {
        id: '1',
        category: 'quick-info',
        title: 'Communication',
        description:
          'Non-verbal when overwhelmed - uses AAC device with picture cards',
        date: new Date(),
      },
      {
        id: '2',
        category: 'quick-info',
        title: 'Emergency Contact',
        description: 'Mom (Emily) - 555-0123',
        date: new Date(),
      },
      {
        id: '3',
        category: 'quick-info',
        title: 'Medical Alert',
        description: 'Allergic to peanuts - carries EpiPen',
        date: new Date(),
      },
      {
        id: '4',
        category: 'daily-support',
        title: 'Sensory Needs',
        description:
          'Calms down with deep pressure, sensitive to loud noises',
        date: new Date(),
      },
      {
        id: '5',
        category: 'daily-support',
        title: 'Daily Routine',
        description:
          'Loves trains and dinosaurs, needs structure for transitions',
        date: new Date(),
      },
      {
        id: '6',
        category: 'daily-support',
        title: 'Comfort Items',
        description:
          'Blue weighted blanket and dinosaur stuffed animal help with anxiety',
        date: new Date(),
      },
      {
        id: '7',
        category: 'health-therapy',
        title: 'Medications',
        description: 'Melatonin 3mg at bedtime for sleep',
        date: new Date(),
      },
      {
        id: '8',
        category: 'health-therapy',
        title: 'Therapy Schedule',
        description: 'Speech therapy Tuesdays, OT Thursdays at 3pm',
        date: new Date(),
      },
      {
        id: '9',
        category: 'education-goals',
        title: 'IEP Goals',
        description:
          'Working on 2-word phrases and following 2-step directions',
        date: new Date(),
      },
      {
        id: '10',
        category: 'education-goals',
        title: 'Learning Style',
        description:
          'Visual learner - responds well to picture cards and demonstrations',
        date: new Date(),
      },
      {
        id: '11',
        category: 'behavior-social',
        title: 'Triggers',
        description:
          'Loud unexpected noises, changes in routine without warning',
        date: new Date(),
      },
      {
        id: '12',
        category: 'behavior-social',
        title: 'Social Preferences',
        description: 'Prefers parallel play, working on turn-taking skills',
        date: new Date(),
      },
      {
        id: '13',
        category: 'family-resources',
        title: 'Support Team',
        description:
          'Dr. Martinez (pediatrician), Ms. Johnson (special ed teacher)',
        date: new Date(),
      },
      {
        id: '14',
        category: 'family-resources',
        title: 'Helpful Resources',
        description:
          'Local autism support group meets first Saturday of each month',
        date: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Saves profile to storage
 */
export const saveProfile = async (profile) => {
  await StorageService.saveProfile(profile);
};

/**
 * Clears all profiles and storage (for demo mode)
 */
export const clearAllProfiles = async () => {
  await AsyncStorage.removeItem('profiles');
  await AsyncStorage.removeItem('childProfile');
  await AsyncStorage.removeItem('manylla_profile');
};

/**
 * Handles profile creation errors
 */
export const handleProfileError = (error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Profile creation error:', error);
  }
  return 'Failed to create profile. Please try again.';
};
