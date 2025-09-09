import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '../types/ChildProfile';

export const initializeSampleData = async () => {
  try {
    const existingProfile = await AsyncStorage.getItem('childProfile');
    
    if (existingProfile === null) {
      const sampleProfile: ChildProfile = {
          id: '1',
          name: 'Alex Johnson',
          dateOfBirth: new Date('2015-01-01'),
          categories: [
            {
              id: 'quick-info',
              name: 'Quick Info',
              displayName: 'Quick Info',
              icon: 'info',
              color: '#F4E4C1',
              order: 0,
              isVisible: true,
              isCustom: false,
              isQuickInfo: true
            },
            {
              id: 'medical',
              name: 'Medical',
              displayName: 'Medical',
              icon: 'medical',
              color: '#FFE5CC',
              order: 1,
              isVisible: true,
              isCustom: false
            },
            {
              id: 'behavior',
              name: 'Behavior',
              displayName: 'Behavior',
              icon: 'behavior',
              color: '#E5F2FF',
              order: 2,
              isVisible: true,
              isCustom: false
            }
          ],
          entries: [
            {
              id: '1',
              category: 'Quick Info',
              title: 'Communication',
              description: 'Non-verbal, uses AAC device',
              date: new Date()
            },
            {
              id: '2',
              category: 'Quick Info',
              title: 'Interests',
              description: 'Loves music and puzzles',
              date: new Date()
            },
            {
              id: '3',
              category: 'Quick Info',
              title: 'Sensory',
              description: 'Sensitive to loud noises',
              date: new Date()
            },
            {
              id: '4',
              category: 'Medical',
              title: 'Daily Medications',
              description: 'Melatonin 3mg at bedtime for sleep',
              date: new Date()
            },
            {
              id: '5',
              category: 'Medical',
              title: 'Allergies',
              description: 'Peanuts - severe (carries EpiPen)',
              date: new Date()
            },
            {
              id: '6',
              category: 'Behavior',
              title: 'Calming Strategies',
              description: 'Deep pressure, weighted blanket, quiet space',
              date: new Date()
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
      };
      
      await AsyncStorage.setItem('childProfile', JSON.stringify(sampleProfile));
      // console.log('Sample profile initialized successfully');
      return sampleProfile;
    }
    
    return JSON.parse(existingProfile);
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return [];
  }
};