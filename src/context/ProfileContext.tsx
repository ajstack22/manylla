import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '../types/ChildProfile';

interface ProfileContextType {
  profiles: ChildProfile[];
  currentProfile: ChildProfile | null;
  setProfiles: (profiles: ChildProfile[]) => void;
  setCurrentProfile: (profile: ChildProfile | null) => void;
  addProfile: (profile: ChildProfile) => Promise<void>;
  updateProfile: (profile: ChildProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  loadProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ChildProfile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const storedProfiles = await AsyncStorage.getItem('profiles');
      if (storedProfiles) {
        const parsedProfiles = JSON.parse(storedProfiles);
        setProfiles(parsedProfiles);
        if (parsedProfiles.length > 0 && !currentProfile) {
          setCurrentProfile(parsedProfiles[0]);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const saveProfiles = async (newProfiles: ChildProfile[]) => {
    try {
      await AsyncStorage.setItem('profiles', JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      console.error('Error saving profiles:', error);
      throw error;
    }
  };

  const addProfile = async (profile: ChildProfile) => {
    const newProfiles = [...profiles, profile];
    await saveProfiles(newProfiles);
    if (!currentProfile) {
      setCurrentProfile(profile);
    }
  };

  const updateProfile = async (updatedProfile: ChildProfile) => {
    const newProfiles = profiles.map(p => 
      p.id === updatedProfile.id ? updatedProfile : p
    );
    await saveProfiles(newProfiles);
    if (currentProfile?.id === updatedProfile.id) {
      setCurrentProfile(updatedProfile);
    }
  };

  const deleteProfile = async (id: string) => {
    const newProfiles = profiles.filter(p => p.id !== id);
    await saveProfiles(newProfiles);
    if (currentProfile?.id === id) {
      setCurrentProfile(newProfiles.length > 0 ? newProfiles[0] : null);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        setProfiles,
        setCurrentProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        loadProfiles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};