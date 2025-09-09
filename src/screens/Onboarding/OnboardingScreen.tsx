import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { OnboardingWizard } from '@components/Onboarding';
import { useProfiles } from '@context/ProfileContext';
import { ChildProfile } from '../../types/ChildProfile';

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setProfiles } = useProfiles();

  const handleStartFresh = async () => {
    // Create a new profile
    const newProfile: ChildProfile = {
      id: Date.now().toString(),
      name: '',
      dateOfBirth: new Date(),
      categories: [],
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setProfiles([newProfile]);
    // Navigation will automatically update based on profile existence
  };

  const handleJoinWithCode = async (code: string) => {
    // TODO: Implement joining with sync code
    // console.log('Join with code:', code);
    // This will eventually sync with the server using the provided code
  };

  const handleDemoMode = async () => {
    // Create a demo profile with sample data
    const demoProfile: ChildProfile = {
      id: 'demo-' + Date.now(),
      name: 'Alex Smith',
      dateOfBirth: new Date('2018-06-15'),
      categories: [
        {
          id: '1',
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
          id: '2',
          name: 'Medical',
          displayName: 'Medical',
          icon: 'medical',
          color: '#FFE5CC',
          order: 1,
          isVisible: true,
          isCustom: false
        },
        {
          id: '3',
          name: 'Education',
          displayName: 'Education',
          icon: 'school',
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
          description: 'Non-verbal when overwhelmed - uses AAC device',
          date: new Date()
        },
        {
          id: '2',
          category: 'Quick Info',
          title: 'Interests',
          description: 'Loves trains and dinosaurs',
          date: new Date()
        },
        {
          id: '3',
          category: 'Quick Info',
          title: 'Sensory',
          description: 'Calms down with deep pressure',
          date: new Date()
        },
        {
          id: '4',
          category: 'Quick Info',
          title: 'Emergency Contact',
          description: 'Mom - 555-0123',
          date: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setProfiles([demoProfile]);
    // Navigation will automatically update based on profile existence
  };

  const handleComplete = async (data: {
    mode: 'fresh' | 'join' | 'demo';
    childName?: string;
    dateOfBirth?: string;
    photo?: string;
    accessCode?: string;
  }) => {
    if (data.mode === 'fresh') {
      await handleStartFresh();
    } else if (data.mode === 'join' && data.accessCode) {
      await handleJoinWithCode(data.accessCode);
    } else if (data.mode === 'demo') {
      await handleDemoMode();
    }
  };

  return (
    <OnboardingWizard
      onComplete={handleComplete}
    />
  );
};

export default OnboardingScreen;