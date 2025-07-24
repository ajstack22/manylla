import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { ManylaThemeProvider } from './context/ThemeContext';
import { SyncProvider } from './context/SyncContext';
import { Header } from './components/Layout/Header';
import { ProfileOverview } from './components/Profile/ProfileOverview';
import { EntryForm } from './components/Forms/EntryForm';
import { ShareDialog } from './components/Sharing/ShareDialog';
import { SharedView } from './components/Sharing/SharedView';
import { SyncDialog } from './components/Sync/SyncDialog';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { ProfileCreateDialog } from './components/Profile/ProfileCreateDialog';
import { ChildProfile, Entry, QuickInfoConfig, CategoryConfig } from './types/ChildProfile';
import { defaultCategories } from './utils/defaultCategories';
import { defaultQuickInfoPanels } from './utils/defaultQuickInfo';

const mockProfile: ChildProfile = {
  id: '1',
  name: 'Ellie Thompson',
  dateOfBirth: new Date('2018-06-15'),
  preferredName: 'Ellie',
  pronouns: 'she/her',
  photo: '/ellie.png',
  categories: defaultCategories,
  themeMode: 'light',
  quickInfoPanels: [
    ...defaultQuickInfoPanels.map(panel => {
      switch(panel.id) {
        case 'communication':
          return { ...panel, value: 'Uses 2-3 word phrases. Understands more than she can express.' };
        case 'sensory':
          return { ...panel, value: 'Sensitive to loud noises and bright lights. Loves soft textures.' };
        case 'medical':
          return { ...panel, value: 'No allergies. Takes melatonin for sleep (prescribed).' };
        case 'dietary':
          return { ...panel, value: 'Gluten-free diet. Prefers crunchy foods. No nuts.' };
        case 'emergency':
          return { ...panel, value: 'Mom: 555-0123, Dad: 555-0124. Dr. Smith: 555-0199' };
        default:
          return panel;
      }
    })
  ],
  entries: [
    {
      id: '1',
      category: 'goals',
      title: 'Improve Communication Skills',
      description: 'Working on using full sentences instead of single words. Practice asking for help with "Can you help me?" instead of just "help".',
      date: new Date('2024-01-15'),
      visibility: 'all'
    },
    {
      id: '2',
      category: 'successes',
      title: 'First Full Day at School',
      description: 'Ellie completed her first full day at school without needing to come home early! She participated in circle time and even raised her hand once.',
      date: new Date('2024-01-10'),
      visibility: 'family'
    },
    {
      id: '3',
      category: 'strengths',
      title: 'Visual Learning',
      description: 'Ellie learns best with visual aids. Picture cards, visual schedules, and demonstrations work much better than verbal instructions alone.',
      date: new Date('2024-01-08'),
      visibility: 'education'
    },
    {
      id: '4',
      category: 'challenges',
      title: 'Loud Noises',
      description: 'Sudden loud noises (fire alarms, hand dryers) cause significant distress. Always warn beforehand when possible. Noise-canceling headphones help.',
      date: new Date('2024-01-05'),
      visibility: 'all'
    },
    {
      id: '5',
      category: 'medical-history',
      title: 'Autism Diagnosis',
      description: 'Diagnosed with Autism Spectrum Disorder at age 3. Evaluation done by Dr. Smith at Children\'s Hospital.',
      date: new Date('2021-08-20'),
      visibility: 'medical'
    },
    {
      id: '6',
      category: 'tips-tricks',
      title: 'Transition Warnings',
      description: 'Give 5 and 2 minute warnings before transitions. Use visual timer. "In 5 minutes, we\'ll clean up and get ready for lunch."',
      date: new Date('2024-01-12'),
      visibility: 'all'
    }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
};

function App() {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Entry['category']>('goals');
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [profileCreateOpen, setProfileCreateOpen] = useState(false);

  // Check for share parameter and stored profile on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('share');
    if (code) {
      setShareCode(code);
      setIsSharedView(true);
      setShowOnboarding(false);
    } else {
      // Check if user has existing profile in localStorage
      const storedProfile = localStorage.getItem('manyla_profile');
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          // Convert date strings back to Date objects
          parsed.dateOfBirth = new Date(parsed.dateOfBirth);
          parsed.createdAt = new Date(parsed.createdAt);
          parsed.updatedAt = new Date(parsed.updatedAt);
          parsed.entries = parsed.entries.map((e: any) => ({
            ...e,
            date: new Date(e.date)
          }));
          setProfile(parsed);
          setShowOnboarding(false);
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }
    }
  }, []);

  const handleAddEntry = (category: Entry['category']) => {
    setSelectedCategory(category);
    setEditingEntry(undefined);
    setEntryFormOpen(true);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setSelectedCategory(entry.category);
    setEntryFormOpen(true);
  };

  const handleSaveEntry = (entryData: Omit<Entry, 'id'>) => {
    if (!profile) return;
    
    if (editingEntry) {
      setProfile({
        ...profile,
        entries: profile.entries.map(e => 
          e.id === editingEntry.id 
            ? { ...entryData, id: editingEntry.id } 
            : e
        ),
        updatedAt: new Date()
      });
    } else {
      const newEntry: Entry = {
        ...entryData,
        id: Date.now().toString()
      };
      setProfile({
        ...profile,
        entries: [...profile.entries, newEntry],
        updatedAt: new Date()
      });
    }
    
    // Save to localStorage
    localStorage.setItem('manyla_profile', JSON.stringify({
      ...profile,
      entries: editingEntry 
        ? profile.entries.map(e => e.id === editingEntry.id ? { ...entryData, id: editingEntry.id } : e)
        : [...profile.entries, { ...entryData, id: Date.now().toString() }],
      updatedAt: new Date()
    }));
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      entries: profile.entries.filter(e => e.id !== entryId),
      updatedAt: new Date()
    });
  };

  const handleStartFresh = () => {
    setProfileCreateOpen(true);
  };

  const handleCreateProfile = (newProfile: ChildProfile) => {
    setProfile(newProfile);
    setShowOnboarding(false);
    setProfileCreateOpen(false);
    
    // Save to localStorage
    localStorage.setItem('manyla_profile', JSON.stringify(newProfile));
  };

  const handleJoinWithCode = (code: string) => {
    // In production, this would validate the code with the server
    // For now, we'll just show the shared view
    setShareCode(code);
    setIsSharedView(true);
    setShowOnboarding(false);
  };

  const handleDemoMode = () => {
    setProfile(mockProfile);
    setIsDemo(true);
    setShowOnboarding(false);
  };

  const handleCloseProfile = () => {
    // Clear the current profile and go back to onboarding
    localStorage.removeItem('manyla_profile');
    setProfile(null);
    setShowOnboarding(true);
    setIsDemo(false);
  };

  const handleUpdateQuickInfo = (panels: QuickInfoConfig[]) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      quickInfoPanels: panels,
      updatedAt: new Date()
    };
    
    setProfile(updatedProfile);
    
    // Save to localStorage
    localStorage.setItem('manyla_profile', JSON.stringify(updatedProfile));
  };

  const handleUpdateCategories = (categories: CategoryConfig[]) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      categories,
      updatedAt: new Date()
    };
    
    setProfile(updatedProfile);
    
    // Save to localStorage
    localStorage.setItem('manyla_profile', JSON.stringify(updatedProfile));
  };

  const handleUpdateProfile = (updates: Partial<ChildProfile>) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };
    
    setProfile(updatedProfile);
    
    // Save to localStorage
    localStorage.setItem('manyla_profile', JSON.stringify(updatedProfile));
  };

  const handleThemeChange = (mode: 'light' | 'dark') => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      themeMode: mode,
      updatedAt: new Date()
    };
    
    setProfile(updatedProfile);
    
    // Save to localStorage
    localStorage.setItem('manyla_profile', JSON.stringify(updatedProfile));
  };


  // Show shared view if accessing via share link
  if (isSharedView && shareCode) {
    return (
      <ManylaThemeProvider>
        <SharedView shareCode={shareCode} />
      </ManylaThemeProvider>
    );
  }

  // Show onboarding if no profile exists
  if (showOnboarding) {
    return (
      <ManylaThemeProvider>
        <OnboardingWizard
          onStartFresh={handleStartFresh}
          onJoinWithCode={handleJoinWithCode}
          onDemoMode={handleDemoMode}
        />
        <ProfileCreateDialog
          open={profileCreateOpen}
          onClose={() => setProfileCreateOpen(false)}
          onCreate={handleCreateProfile}
        />
      </ManylaThemeProvider>
    );
  }

  // Show main app
  if (!profile) return null; // This shouldn't happen, but just in case

  return (
    <SyncProvider>
      <ManylaThemeProvider 
        initialThemeMode={profile?.themeMode || 'light'}
        onThemeChange={handleThemeChange}
      >
        <Header 
          onSyncClick={() => setSyncDialogOpen(true)} 
          onCloseProfile={handleCloseProfile}
          onShare={() => setShareDialogOpen(true)}
        />
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <ProfileOverview
            profile={profile}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onShare={() => setShareDialogOpen(true)}
            onUpdateQuickInfo={handleUpdateQuickInfo}
            onUpdateCategories={handleUpdateCategories}
            onUpdateProfile={handleUpdateProfile}
          />
        </Container>
        <EntryForm
          open={entryFormOpen}
          onClose={() => setEntryFormOpen(false)}
          onSave={handleSaveEntry}
          category={selectedCategory}
          entry={editingEntry}
        />
        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          profile={profile}
        />
        <SyncDialog
          open={syncDialogOpen}
          onClose={() => setSyncDialogOpen(false)}
        />
      </ManylaThemeProvider>
    </SyncProvider>
  );
}

export default App;
