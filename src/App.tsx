import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { ManyllaThemeProvider } from './context/ThemeContext';
import { SyncProvider } from './context/SyncContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Layout/Header';
import { LoadingSpinner } from './components/Loading/LoadingSpinner';
import { LoadingOverlay } from './components/Loading/LoadingOverlay';
import { StorageService } from './services/storageService';
import { ProfileOverview } from './components/Profile/ProfileOverview';
import { EntryForm } from './components/Forms/EntryForm';
import { ShareDialog } from './components/Sharing/ShareDialogNew';
import { SharedView } from './components/Sharing/SharedView';
import { SyncDialog } from './components/Sync/SyncDialog';
import { UnifiedCategoryManager } from './components/Settings/UnifiedCategoryManager';
import { ProgressiveOnboarding } from './components/Onboarding/ProgressiveOnboarding';
import { ProfileCreateDialog } from './components/Profile/ProfileCreateDialog';
import { ChildProfile, Entry, CategoryConfig } from './types/ChildProfile';
import { unifiedCategories } from './utils/unifiedCategories';

// Create initial Quick Info entry
const quickInfoEntries: Entry[] = [
  {
    id: 'qi-1',
    category: 'quick-info',
    title: 'Essential Information',
    description: `<strong>Communication:</strong> Uses 2-3 word phrases. Understands more than she can express.
    
<strong>Sensory:</strong> Sensitive to loud noises and bright lights. Loves soft textures.

<strong>Medical:</strong> No allergies. Takes melatonin for sleep (prescribed).

<strong>Dietary:</strong> Gluten-free diet. Prefers crunchy foods. No nuts.

<strong>Emergency Contacts:</strong> Mom: 555-0123, Dad: 555-0124. Dr. Smith: 555-0199`,
    date: new Date(),
    visibility: ['private'],
  },
];

const mockProfile: ChildProfile = {
  id: '1',
  name: 'Ellie Thompson',
  dateOfBirth: new Date('2018-06-15'),
  preferredName: 'Ellie',
  pronouns: 'she/her',
  photo: '/ellie.png',
  categories: unifiedCategories,
  themeMode: 'dark',
  quickInfoPanels: [], // Will be removed in future
  entries: [
    ...quickInfoEntries,
    {
      id: '1',
      category: 'goals',
      title: 'Improve Communication Skills',
      description: 'Working on using full sentences instead of single words. Practice asking for help with "Can you help me?" instead of just "help".',
      date: new Date('2024-01-15'),
      visibility: ['family', 'medical', 'education']
    },
    {
      id: '2',
      category: 'successes',
      title: 'First Full Day at School',
      description: 'Ellie completed her first full day at school without needing to come home early! She participated in circle time and even raised her hand once.',
      date: new Date('2024-01-10'),
      visibility: ['family']
    },
    {
      id: '3',
      category: 'education',
      title: 'Visual Learning',
      description: 'Ellie learns best with visual aids. Picture cards, visual schedules, and demonstrations work much better than verbal instructions alone.',
      date: new Date('2024-01-08'),
      visibility: ['education']
    },
    {
      id: '4',
      category: 'behaviors',
      title: 'Loud Noises',
      description: 'Sudden loud noises (fire alarms, hand dryers) cause significant distress. Always warn beforehand when possible. Noise-canceling headphones help.',
      date: new Date('2024-01-05'),
      visibility: ['family', 'medical', 'education']
    },
    {
      id: '5',
      category: 'medical',
      title: 'Autism Diagnosis',
      description: 'Diagnosed with Autism Spectrum Disorder at age 3. Evaluation done by Dr. Smith at Children\'s Hospital.',
      date: new Date('2021-08-20'),
      visibility: ['medical']
    },
    {
      id: '6',
      category: 'tips-tricks',
      title: 'Transition Warnings',
      description: 'Give 5 and 2 minute warnings before transitions. Use visual timer. "In 5 minutes, we\'ll clean up and get ready for lunch."',
      date: new Date('2024-01-12'),
      visibility: ['family', 'medical', 'education']
    }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
};

function App() {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Entry['category']>('goals');
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [profileCreateOpen, setProfileCreateOpen] = useState(false);

  // Check for share parameter and stored profile on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('share');
        if (code) {
          setShareCode(code);
          setIsSharedView(true);
          setShowOnboarding(false);
        } else {
          // Check if onboarding has been completed
          const onboardingCompleted = localStorage.getItem('manylla_onboarding_completed') === 'true';
          const storedProfile = StorageService.getProfile();
          
          // Only proceed if onboarding is complete AND we have a valid profile with a name
          if (onboardingCompleted && storedProfile && storedProfile.name) {
            // Update stored profile with new categories structure
            const updatedProfile = {
              ...storedProfile,
              categories: unifiedCategories
            };
            setProfile(updatedProfile);
            setShowOnboarding(false);
          } else {
            // Show onboarding if not completed or profile is invalid
            setShowOnboarding(true);
            // Clear any invalid data
            if (!storedProfile?.name) {
              localStorage.removeItem('manylla_profile');
              localStorage.removeItem('manylla_onboarding_completed');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
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

  const handleSaveEntry = async (entryData: Omit<Entry, 'id'>) => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      let updatedProfile: ChildProfile;
      
      if (editingEntry) {
        updatedProfile = {
          ...profile,
          entries: profile.entries.map(e => 
            e.id === editingEntry.id 
              ? { ...entryData, id: editingEntry.id } 
              : e
          ),
          updatedAt: new Date()
        };
      } else {
        const newEntry: Entry = {
          ...entryData,
          id: Date.now().toString()
        };
        updatedProfile = {
          ...profile,
          entries: [...profile.entries, newEntry],
          updatedAt: new Date()
        };
      }
      
      // Save using StorageService with validation
      const saved = StorageService.saveProfile(updatedProfile);
      if (saved) {
        setProfile(updatedProfile);
      } else {
        console.error('Failed to save profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const updatedProfile = {
        ...profile,
        entries: profile.entries.filter(e => e.id !== entryId),
        updatedAt: new Date()
      };
      
      const saved = StorageService.saveProfile(updatedProfile);
      if (saved) {
        setProfile(updatedProfile);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartFresh = () => {
    setProfileCreateOpen(true);
  };

  const handleCreateProfile = (newProfile: ChildProfile) => {
    setProfile(newProfile);
    setShowOnboarding(false);
    setProfileCreateOpen(false);
    
    // Save to localStorage and mark onboarding as complete
    localStorage.setItem('manylla_profile', JSON.stringify(newProfile));
    localStorage.setItem('manylla_onboarding_completed', 'true');
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
    setShowOnboarding(false);
    // Save demo profile to localStorage
    localStorage.setItem('manylla_profile', JSON.stringify(mockProfile));
    // Mark onboarding as complete for demo mode
    localStorage.setItem('manylla_onboarding_completed', 'true');
  };

  const handleCloseProfile = () => {
    // Clear the current profile and onboarding flag
    localStorage.removeItem('manylla_profile');
    localStorage.removeItem('manylla_onboarding_completed');
    setProfile(null);
    setShowOnboarding(true);
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
    localStorage.setItem('manylla_profile', JSON.stringify(updatedProfile));
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
    localStorage.setItem('manylla_profile', JSON.stringify(updatedProfile));
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
    localStorage.setItem('manylla_profile', JSON.stringify(updatedProfile));
  };


  // Show loading spinner during initial load
  if (isLoading) {
    return (
      <ManyllaThemeProvider>
        <ToastProvider>
          <LoadingSpinner fullScreen message="Loading your profile..." />
        </ToastProvider>
      </ManyllaThemeProvider>
    );
  }

  // Show shared view if accessing via share link
  if (isSharedView && shareCode) {
    return (
      <ManyllaThemeProvider initialThemeMode="manylla">
        <ToastProvider>
          <SharedView shareCode={shareCode} />
        </ToastProvider>
      </ManyllaThemeProvider>
    );
  }

  // Show onboarding if no profile exists
  if (showOnboarding) {
    return (
      <ManyllaThemeProvider>
        <ToastProvider>
          <ProgressiveOnboarding
          onComplete={(data) => {
            if (data.mode === 'demo') {
              handleDemoMode();
            } else if (data.mode === 'join' && data.accessCode) {
              handleJoinWithCode(data.accessCode);
            } else {
              // For fresh mode, create profile with the provided name
              // Ensure we have a valid name before proceeding
              if (!data.childName || !data.childName.trim()) {
                console.error('Cannot create profile without child name');
                return;
              }
              const newProfile: ChildProfile = {
                id: Date.now().toString(),
                name: data.childName.trim(),
                preferredName: data.preferredName?.trim() || data.childName.trim(),
                dateOfBirth: new Date(),
                pronouns: '',
                photo: '',
                categories: unifiedCategories,
                themeMode: 'dark',
                quickInfoPanels: [],
                entries: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                visibility: ['private'],
              };
              handleCreateProfile(newProfile);
            }
          }}
        />
        </ToastProvider>
      </ManyllaThemeProvider>
    );
  }

  // Show main app
  if (!profile) return null; // This shouldn't happen, but just in case

  return (
    <SyncProvider>
      <ManyllaThemeProvider 
        initialThemeMode={profile?.themeMode || 'light'}
        onThemeChange={handleThemeChange}
      >
        <ToastProvider>
        <Header 
          onSyncClick={() => setSyncDialogOpen(true)} 
          onCloseProfile={handleCloseProfile}
          onShare={() => setShareDialogOpen(true)}
          onCategoriesClick={() => setCategoriesOpen(true)}
          syncStatus="not-setup" // TODO: Get from sync context
        />
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <ProfileOverview
            profile={profile}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onShare={() => setShareDialogOpen(true)}
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
          categories={profile.categories.filter(c => c.isVisible)}
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
        <UnifiedCategoryManager
          open={categoriesOpen}
          onClose={() => setCategoriesOpen(false)}
          categories={profile.categories}
          onUpdate={handleUpdateCategories}
        />
        <LoadingOverlay open={isSaving} message="Saving..." />
        </ToastProvider>
      </ManyllaThemeProvider>
    </SyncProvider>
  );
}

export default App;
