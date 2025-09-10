// React imports
import React from "react";

// React Native imports (navigation is RN)
import { useNavigation } from "@react-navigation/native";

// Third-party libraries
// (none in this file)

// Context/Hooks
import { useProfiles } from "@context/ProfileContext";

// Components
import { OnboardingWizard } from "@components/Onboarding";

// Utils and types
import { ChildProfile } from "../../types/ChildProfile";
import { unifiedCategories } from "../../utils/unifiedCategories";

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
    // TODO: Implement joining with sync code
    // This will eventually sync with the server using the provided code
  };

  const handleDemoMode = async () => {
    // Create a demo profile with sample data
    const demoProfile = {
      id: "demo-" + Date.now(),
      name: "Ellie Thompson",
      preferredName: "Ellie",
      pronouns: "she/her",
      dateOfBirth: new Date("2018-06-15"),
      photo: "/ellie.png",
      // Use unified categories from the shared configuration
      categories: [...unifiedCategories],
      entries: [
        {
          id: "1",
          category: "quick-info",
          title: "Communication",
          description:
            "Non-verbal when overwhelmed - uses AAC device with picture cards",
          date: new Date(),
        },
        {
          id: "2",
          category: "quick-info",
          title: "Emergency Contact",
          description: "Mom (Emily) - 555-0123",
          date: new Date(),
        },
        {
          id: "3",
          category: "quick-info",
          title: "Medical Alert",
          description: "Allergic to peanuts - carries EpiPen",
          date: new Date(),
        },
        {
          id: "4",
          category: "daily-support",
          title: "Sensory Needs",
          description:
            "Calms down with deep pressure, sensitive to loud noises",
          date: new Date(),
        },
        {
          id: "5",
          category: "daily-support",
          title: "Daily Routine",
          description:
            "Loves trains and dinosaurs, needs structure for transitions",
          date: new Date(),
        },
        {
          id: "6",
          category: "daily-support",
          title: "Comfort Items",
          description:
            "Blue weighted blanket and dinosaur stuffed animal help with anxiety",
          date: new Date(),
        },
        {
          id: "7",
          category: "health-therapy",
          title: "Medications",
          description: "Melatonin 3mg at bedtime for sleep",
          date: new Date(),
        },
        {
          id: "8",
          category: "health-therapy",
          title: "Therapy Schedule",
          description: "Speech therapy Tuesdays, OT Thursdays at 3pm",
          date: new Date(),
        },
        {
          id: "9",
          category: "education-goals",
          title: "IEP Goals",
          description:
            "Working on 2-word phrases and following 2-step directions",
          date: new Date(),
        },
        {
          id: "10",
          category: "education-goals",
          title: "Learning Style",
          description:
            "Visual learner - responds well to picture cards and demonstrations",
          date: new Date(),
        },
        {
          id: "11",
          category: "behavior-social",
          title: "Triggers",
          description:
            "Loud unexpected noises, changes in routine without warning",
          date: new Date(),
        },
        {
          id: "12",
          category: "behavior-social",
          title: "Social Preferences",
          description: "Prefers parallel play, working on turn-taking skills",
          date: new Date(),
        },
        {
          id: "13",
          category: "family-resources",
          title: "Support Team",
          description:
            "Dr. Martinez (pediatrician), Ms. Johnson (special ed teacher)",
          date: new Date(),
        },
        {
          id: "14",
          category: "family-resources",
          title: "Helpful Resources",
          description:
            "Local autism support group meets first Saturday of each month",
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
