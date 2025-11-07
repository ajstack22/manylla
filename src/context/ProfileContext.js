import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
const ProfileContext = createContext(undefined);

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);

  const loadProfiles = useCallback(async () => {
    try {
      const storedProfiles = await AsyncStorage.getItem("profiles");
      if (storedProfiles) {
        const parsedProfiles = JSON.parse(storedProfiles);
        setProfiles(parsedProfiles);
        if (parsedProfiles.length > 0 && !currentProfile) {
          setCurrentProfile(parsedProfiles[0]);
        }
      }
    } catch (error) {
      // Silent failure for loadProfiles - prevents app crash on storage issues
      // App will function normally with empty profiles array
      // Security: Only logging error.message (not full error object) to prevent potential info leaks
      if (process.env.NODE_ENV === 'development') {
        console.warn("Failed to load profiles from storage:", error.message);
      }
    }
  }, [currentProfile]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const saveProfiles = async (newProfiles) => {
    try {
      await AsyncStorage.setItem("profiles", JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      throw error;
    }
  };

  const addProfile = async (profile) => {
    const newProfiles = [...profiles, profile];
    await saveProfiles(newProfiles);
    if (!currentProfile) {
      setCurrentProfile(profile);
    }
  };

  const updateProfile = async (updatedProfile) => {
    const newProfiles = profiles.map((p) =>
      p.id === updatedProfile.id ? updatedProfile : p,
    );
    await saveProfiles(newProfiles);
    if (currentProfile?.id === updatedProfile.id) {
      setCurrentProfile(updatedProfile);
    }
  };

  const deleteProfile = async (id) => {
    const newProfiles = profiles.filter((p) => p.id !== id);
    await saveProfiles(newProfiles);
    if (currentProfile?.id === id) {
      setCurrentProfile(newProfiles.length > 0 ? newProfiles[0] : null);
    }
  };

  // Entry management functions
  const addEntry = async (profileId, entryData) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    // Validate attachments if present
    if (entryData.attachments) {
      for (const att of entryData.attachments) {
        if (!att.id || !att.fileHash || !att.encryptedMeta) {
          throw new Error('Invalid attachment metadata');
        }
      }
    }

    const newEntry = {
      id: `entry-${Date.now()}`,
      ...entryData,
      date: entryData.date || new Date().toISOString(),
      attachments: entryData.attachments || []
    };

    const updatedProfile = {
      ...profile,
      entries: [...(profile.entries || []), newEntry]
    };

    await updateProfile(updatedProfile);
    return newEntry;
  };

  const updateEntry = async (profileId, entryId, entryData) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      entries: (profile.entries || []).map(entry =>
        entry.id === entryId
          ? { ...entry, ...entryData, updatedAt: new Date().toISOString() }
          : entry
      )
    };

    await updateProfile(updatedProfile);
  };

  const deleteEntry = async (profileId, entryId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      entries: (profile.entries || []).filter(entry => entry.id !== entryId)
    };

    await updateProfile(updatedProfile);
  };

  // Attachment management
  const addAttachmentToEntry = async (profileId, entryId, attachment) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const entry = (profile.entries || []).find(e => e.id === entryId);
    if (!entry) return;

    const updatedEntry = {
      ...entry,
      attachments: [...(entry.attachments || []), attachment],
      updatedAt: new Date().toISOString()
    };

    await updateEntry(profileId, entryId, updatedEntry);
  };

  const removeAttachmentFromEntry = async (profileId, entryId, attachmentId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const entry = (profile.entries || []).find(e => e.id === entryId);
    if (!entry) return;

    const updatedEntry = {
      ...entry,
      attachments: (entry.attachments || []).filter(a => a.id !== attachmentId),
      updatedAt: new Date().toISOString()
    };

    await updateEntry(profileId, entryId, updatedEntry);
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        setProfiles,
        saveProfiles, // Added to allow saving profiles with persistence
        setCurrentProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        loadProfiles,
        // Entry management
        addEntry,
        updateEntry,
        deleteEntry,
        // Attachment management
        addAttachmentToEntry,
        removeAttachmentFromEntry,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfiles must be used within a ProfileProvider");
  }
  return context;
};
