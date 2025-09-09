import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '../types/ChildProfile';

export const initializeSampleData = async () => {
  try {
    const existingProfile = await AsyncStorage.getItem('childProfile');
    
    if (existingProfile === null) {
      const sampleProfile: ChildProfile = {
          id: '1',
          name: 'Alex Johnson',
          diagnosis: 'Autism Spectrum Disorder',
          quickInfo: [
            'Non-verbal, uses AAC device',
            'Loves music and puzzles',
            'Sensitive to loud noises'
          ],
          medical: [
            {
              title: 'Daily Medications',
              description: 'Melatonin 3mg at bedtime for sleep'
            },
            {
              title: 'Allergies',
              description: 'Peanuts - severe (carries EpiPen)'
            }
          ],
          behavior: [
            {
              title: 'Calming Strategies',
              description: 'Deep pressure, weighted blanket, quiet space'
            }
          ],
          sensory: [
            {
              title: 'Sensitivities',
              description: 'Avoid fluorescent lights, prefers dim lighting'
            },
            {
              title: 'Preferences',
              description: 'Likes soft textures, fidget toys help with focus'
            }
          ],
          dietary: [
            {
              title: 'Restricted Foods',
              description: 'No peanuts, tree nuts, or shellfish'
            },
            {
              title: 'Preferred Foods',
              description: 'Mac and cheese, apple slices, crackers'
            }
          ],
          communication: [
            {
              title: 'Primary Method',
              description: 'AAC device with Proloquo2Go app'
            },
            {
              title: 'Understanding',
              description: 'Understands simple instructions, may need visual supports'
            }
          ],
          daily: [
            {
              title: 'Morning Routine',
              description: 'Visual schedule helps with transitions'
            }
          ],
          education: [
            {
              title: 'IEP Goals',
              description: 'Focus on communication and social skills'
            }
          ],
          emergency: [
            {
              title: 'Emergency Contact',
              description: 'Mom: (555) 123-4567'
            },
            {
              title: 'Hospital Preference',
              description: 'Children\'s Hospital - has medical records on file'
            }
          ],
          customCategories: []
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