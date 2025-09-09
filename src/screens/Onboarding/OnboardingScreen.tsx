import React from 'react';
import { useNavigation } from '@react-navigation/native';
import OnboardingWizard from '@components/Onboarding';
import { useProfile } from '@context/ProfileContext';
import { ChildProfile } from '@types/ChildProfile';

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setProfile } = useProfile();

  const handleStartFresh = async () => {
    // Create a new profile
    const newProfile: ChildProfile = {
      id: Date.now().toString(),
      name: '',
      dateOfBirth: '',
      diagnosis: [],
      medications: [],
      therapies: [],
      education: {
        school: '',
        grade: '',
        iepGoals: [],
        accommodations: [],
      },
      medical: {
        conditions: [],
        allergies: [],
        providers: [],
      },
      documents: [],
      quickInfo: [],
      lastUpdated: new Date().toISOString(),
    };

    await setProfile(newProfile);
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
      dateOfBirth: '2018-06-15',
      diagnosis: ['Autism Spectrum Disorder', 'ADHD'],
      medications: [
        {
          id: '1',
          name: 'Methylphenidate',
          dosage: '10mg',
          frequency: 'Once daily',
          prescriber: 'Dr. Johnson',
        },
      ],
      therapies: [
        {
          id: '1',
          type: 'Speech Therapy',
          provider: 'Sarah Williams, SLP',
          frequency: 'Weekly',
          location: 'Children\'s Therapy Center',
        },
        {
          id: '2',
          type: 'Occupational Therapy',
          provider: 'Michael Chen, OTR/L',
          frequency: 'Bi-weekly',
          location: 'Children\'s Therapy Center',
        },
      ],
      education: {
        school: 'Sunshine Elementary School',
        grade: '1st Grade',
        teacher: 'Ms. Thompson',
        iepGoals: [
          {
            id: '1',
            category: 'Communication',
            goal: 'Improve verbal communication in classroom settings',
            targetDate: '2024-06-01',
          },
          {
            id: '2',
            category: 'Social Skills',
            goal: 'Engage in cooperative play with peers for 10 minutes',
            targetDate: '2024-06-01',
          },
        ],
        accommodations: [
          'Preferential seating near teacher',
          'Visual schedule',
          'Sensory breaks as needed',
          'Modified assignments',
        ],
      },
      medical: {
        conditions: ['Autism Spectrum Disorder', 'ADHD', 'Sensory Processing Disorder'],
        allergies: ['Peanuts', 'Tree nuts'],
        providers: [
          {
            id: '1',
            name: 'Dr. Emily Johnson',
            specialty: 'Developmental Pediatrics',
            phone: '555-0100',
            location: 'Children\'s Medical Center',
          },
          {
            id: '2',
            name: 'Dr. Robert Martinez',
            specialty: 'Child Psychiatry',
            phone: '555-0101',
            location: 'Behavioral Health Clinic',
          },
        ],
      },
      documents: [],
      quickInfo: [
        'Non-verbal when overwhelmed - uses AAC device',
        'Loves trains and dinosaurs',
        'Calms down with deep pressure',
        'Emergency contact: Mom - 555-0123',
      ],
      lastUpdated: new Date().toISOString(),
    };

    await setProfile(demoProfile);
    // Navigation will automatically update based on profile existence
  };

  return (
    <OnboardingWizard
      onStartFresh={handleStartFresh}
      onJoinWithCode={handleJoinWithCode}
      onDemoMode={handleDemoMode}
    />
  );
};

export default OnboardingScreen;