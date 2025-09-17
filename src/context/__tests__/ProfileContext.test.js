/**
 * Tests for ProfileContext
 */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileProvider, useProfiles } from "../ProfileContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("ProfileContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
  });

  const wrapper = ({ children }) => (
    <ProfileProvider>{children}</ProfileProvider>
  );

  describe("ProfileProvider", () => {
    it("should provide initial empty state", () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });

      expect(result.current.profiles).toEqual([]);
      expect(result.current.currentProfile).toBeNull();
    });

    it("should provide profile management functions", () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });

      expect(typeof result.current.addProfile).toBe("function");
      expect(typeof result.current.updateProfile).toBe("function");
      expect(typeof result.current.deleteProfile).toBe("function");
      expect(typeof result.current.loadProfiles).toBe("function");
      expect(typeof result.current.saveProfiles).toBe("function");
      expect(typeof result.current.setProfiles).toBe("function");
      expect(typeof result.current.setCurrentProfile).toBe("function");
    });

    it("should load profiles from storage on mount", async () => {
      const mockProfiles = [
        { id: "1", name: "Test Profile 1" },
        { id: "2", name: "Test Profile 2" }
      ];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockProfiles));

      const { result } = renderHook(() => useProfiles(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.profiles).toEqual(mockProfiles);
      expect(result.current.currentProfile).toEqual(mockProfiles[0]);
    });

    it("should handle storage load errors gracefully", async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const { result } = renderHook(() => useProfiles(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.profiles).toEqual([]);
      expect(result.current.currentProfile).toBeNull();
    });

    it("should add new profile", async () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const newProfile = { id: "1", name: "New Profile" };

      await act(async () => {
        await result.current.addProfile(newProfile);
      });

      expect(result.current.profiles).toContain(newProfile);
      expect(result.current.currentProfile).toEqual(newProfile);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "profiles",
        JSON.stringify([newProfile])
      );
    });

    it("should not set current profile when adding if one exists", async () => {
      const existingProfile = { id: "1", name: "Existing Profile" };
      const { result } = renderHook(() => useProfiles(), { wrapper });

      // Set existing current profile
      await act(async () => {
        await result.current.addProfile(existingProfile);
      });

      const newProfile = { id: "2", name: "New Profile" };
      await act(async () => {
        await result.current.addProfile(newProfile);
      });

      expect(result.current.profiles).toHaveLength(2);
      expect(result.current.currentProfile).toEqual(existingProfile);
    });

    it("should update existing profile", async () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const originalProfile = { id: "1", name: "Original Name" };
      const updatedProfile = { id: "1", name: "Updated Name" };

      await act(async () => {
        await result.current.addProfile(originalProfile);
      });

      await act(async () => {
        await result.current.updateProfile(updatedProfile);
      });

      expect(result.current.profiles[0]).toEqual(updatedProfile);
      expect(result.current.currentProfile).toEqual(updatedProfile);
    });

    it("should update current profile when updating current profile", async () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const originalProfile = { id: "1", name: "Original Name" };
      const updatedProfile = { id: "1", name: "Updated Name" };

      await act(async () => {
        await result.current.addProfile(originalProfile);
      });

      await act(async () => {
        await result.current.updateProfile(updatedProfile);
      });

      expect(result.current.currentProfile).toEqual(updatedProfile);
    });

    it("should delete profile", async () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const profile1 = { id: "1", name: "Profile 1" };
      const profile2 = { id: "2", name: "Profile 2" };

      await act(async () => {
        await result.current.addProfile(profile1);
        await result.current.addProfile(profile2);
      });

      await act(async () => {
        await result.current.deleteProfile("1");
      });

      expect(result.current.profiles).toHaveLength(1);
      expect(result.current.profiles[0]).toEqual(profile2);
      expect(result.current.currentProfile).toEqual(profile2);
    });

    it("should handle deleting current profile", async () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const profile1 = { id: "1", name: "Profile 1" };
      const profile2 = { id: "2", name: "Profile 2" };

      await act(async () => {
        await result.current.addProfile(profile1);
      });

      // First profile should be set as current
      expect(result.current.currentProfile).toEqual(profile1);

      await act(async () => {
        await result.current.addProfile(profile2);
      });

      // Current profile should still be profile1 after adding second
      expect(result.current.currentProfile).toEqual(profile1);

      await act(async () => {
        await result.current.deleteProfile("1");
      });

      expect(result.current.currentProfile).toEqual(profile2);
    });

    it("should set current profile to null when deleting last profile", async () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const profile = { id: "1", name: "Only Profile" };

      await act(async () => {
        await result.current.addProfile(profile);
      });

      await act(async () => {
        await result.current.deleteProfile("1");
      });

      expect(result.current.profiles).toHaveLength(0);
      expect(result.current.currentProfile).toBeNull();
    });

    it("should save profiles to storage", async () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const profiles = [
        { id: "1", name: "Profile 1" },
        { id: "2", name: "Profile 2" }
      ];

      await act(async () => {
        await result.current.saveProfiles(profiles);
      });

      expect(result.current.profiles).toEqual(profiles);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "profiles",
        JSON.stringify(profiles)
      );
    });

    it("should handle save errors", async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error("Save error"));
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const profiles = [{ id: "1", name: "Profile 1" }];

      await expect(
        act(async () => {
          await result.current.saveProfiles(profiles);
        })
      ).rejects.toThrow("Save error");
    });

    it("should allow manual profile state setting", () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const profiles = [{ id: "1", name: "Manual Profile" }];

      act(() => {
        result.current.setProfiles(profiles);
      });

      expect(result.current.profiles).toEqual(profiles);
    });

    it("should allow manual current profile setting", () => {
      const { result } = renderHook(() => useProfiles(), { wrapper });
      const profile = { id: "1", name: "Current Profile" };

      act(() => {
        result.current.setCurrentProfile(profile);
      });

      expect(result.current.currentProfile).toEqual(profile);
    });
  });

  describe("useProfiles hook", () => {
    it("should throw error when used outside ProfileProvider", () => {
      // Suppress error boundary warnings
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useProfiles());
      }).toThrow("useProfiles must be used within a ProfileProvider");

      console.error = originalError;
    });
  });
});