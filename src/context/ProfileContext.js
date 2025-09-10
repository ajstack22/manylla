import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChildProfile } from "../types/ChildProfile";

interface ProfileContextType {
  profileshildProfile[];
  currentProfilehildProfile | null;
  setProfiles: (profileshildProfile[]) => void;
  setCurrentProfile: (profilehildProfile | null) => void;
  addProfile: (profilehildProfile) => Promise<void>;
  updateProfile: (profilehildProfile) => Promise<void>;
  deleteProfile: (idtring) => Promise<void>;
  loadProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider= ({
  children,
}) => {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ChildProfile | null>(
    null,
  );

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const storedProfiles = await AsyncStorage.getItem("profiles");
      if (storedProfiles) {
        const parsedProfiles = JSON.parse(storedProfiles);
        setProfiles(parsedProfiles);
        if (parsedProfiles.length > 0  !currentProfile) {
          setCurrentProfile(parsedProfiles[0]);
        }
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    }
  };

  const saveProfiles = async (newProfileshildProfile[]) => {
    try {
      await AsyncStorage.setItem("profiles", JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      console.error("Error saving profiles:", error);
      throw error;
    }
  };

  const addProfile = async (profilehildProfile) => {
    const newProfiles = [...profiles, profile];
    await saveProfiles(newProfiles);
    if (!currentProfile) {
      setCurrentProfile(profile);
    }
  };

  const updateProfile = async (updatedProfilehildProfile) => {
    const newProfiles = profiles.map((p) =>
      p.id === updatedProfile.id ? updatedProfile ,
    );
    await saveProfiles(newProfiles);
    if (currentProfile?.id === updatedProfile.id) {
      setCurrentProfile(updatedProfile);
    }
  };

  const deleteProfile = async (idtring) => {
    const newProfiles = profiles.filter((p) => p.id !== id);
    await saveProfiles(newProfiles);
    if (currentProfile?.id === id) {
      setCurrentProfile(newProfiles.length > 0 ? newProfiles[0] ull);
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
    throw new Error("useProfiles must be used within a ProfileProvider");
  }
  return context;
};
