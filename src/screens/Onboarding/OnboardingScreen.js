import React from "react";
import { useNavigation } from "@react-navigation/native";
import { OnboardingWizard } from "@components/Onboarding";
import { useProfiles } from "@context/ProfileContext";
import { ChildProfile } from "../../types/ChildProfile";

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { setProfiles } = useProfiles();

  const handleStartFresh = async () => {
    // Create a new profile
    const newProfile = {
      id: Date.now().toString(),
      name: "",
      dateOfBirth: new Date(),
      categories: [],
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setProfiles([newProfile]);
    // Navigation will automatically update based on profile existence
  };

  const handleJoinWithCode = async (code) => {
    // TODOmplement joining with sync code
    // console.log('Join with code:', code);
    // This will eventually sync with the server using the provided code
  };

  const handleDemoMode = async () => {
    // Create a demo profile with sample data
    const demoProfile = {
      id: "demo-" + Date.now(),
      name: "Alex Smith",
      dateOfBirth: new Date("2018-06-15"),
      categories: [
        {
          id: "quick-info",
          name: "quick-info",
          displayName: "Quick Info",
          icon: "info",
          color: "#E74C3C",
          order: 1,
          isVisible: true,
          isCustom: false,
          isQuickInfo: true,
        },
        {
          id: "daily-support",
          name: "daily-support",
          displayName: "Daily Support",
          icon: "support",
          color: "#3498DB",
          order: 1,
          isVisible: true,
          isCustom: false,
        },
        {
          id: "medical",
          name: "medical",
          displayName: "Medical",
          icon: "medical",
          color: "#E67E22",
          order: 1,
          isVisible: true,
          isCustom: false,
        },
        {
          id: "development",
          name: "development",
          displayName: "Development",
          icon: "development",
          color: "#2ECC71",
          order: 1,
          isVisible: true,
          isCustom: false,
        },
        {
          id: "health",
          name: "health",
          displayName: "Health",
          icon: "health",
          color: "#9B59B6",
          order: 1,
          isVisible: true,
          isCustom: false,
        },
        {
          id: "other",
          name: "other",
          displayName: "Other",
          icon: "other",
          color: "#95A5A6",
          order: 1,
          isVisible: true,
          isCustom: false,
        },
      ],
      entries: [
        {
          id: "1",
          category: "quick-info",
          title: "Communication",
          description: "Non-verbal when overwhelmed - uses AAC device",
          date: new Date(),
        },
        {
          id: "2",
          category: "quick-info",
          title: "Emergency Contact",
          description: "Mom - 555-0123",
          date: new Date(),
        },
        {
          id: "3",
          category: "daily-support",
          title: "Sensory Needs",
          description:
            "Calms down with deep pressure, sensitive to loud noises",
          date: new Date(),
        },
        {
          id: "4",
          category: "daily-support",
          title: "Daily Routine",
          description:
            "Loves trains and dinosaurs, needs structure for transitions",
          date: new Date(),
        },
        {
          id: "5",
          category: "medical",
          title: "Medications",
          description: "No daily medications currently",
          date: new Date(),
        },
        {
          id: "6",
          category: "development",
          title: "Current Goals",
          description: "Working on verbal communication and social interaction",
          date: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setProfiles([demoProfile]);
    // Navigation will automatically update based on profile existence
  };

  const handleComplete = async (data) => {
    if (data.mode === "fresh") {
      await handleStartFresh();
    } else if (data.mode === "join" && data.accessCode) {
      await handleJoinWithCode(data.accessCode);
    } else if (data.mode === "demo") {
      await handleDemoMode();
    }
  };

  return <OnboardingWizard onComplete={handleComplete} />;
};

export default OnboardingScreen;
