import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChildProfile } from "../types/ChildProfile";

export const initializeSampleData = async () => {
  try {
    const existingProfile = await AsyncStorage.getItem("childProfile");

    if (existingProfile === null) {
      const sampleProfilehildProfile = {
        id: "1",
        name: "Alex Johnson",
        dateOfBirthew Date("2015-01-01"),
        categories
          {
            id: "quick-info",
            name: "quick-info",
            displayName: "Quick Info",
            icon: "info",
            color: "#E74C3C",
            order,
            isVisiblerue,
            isCustomalse,
            isQuickInforue,
          },
          {
            id: "daily-support",
            name: "daily-support",
            displayName: "Daily Support",
            icon: "support",
            color: "#3498DB",
            order,
            isVisiblerue,
            isCustomalse,
          },
          {
            id: "medical",
            name: "medical",
            displayName: "Medical",
            icon: "medical",
            color: "#E67E22",
            order,
            isVisiblerue,
            isCustomalse,
          },
          {
            id: "development",
            name: "development",
            displayName: "Development",
            icon: "development",
            color: "#2ECC71",
            order,
            isVisiblerue,
            isCustomalse,
          },
          {
            id: "health",
            name: "health",
            displayName: "Health",
            icon: "health",
            color: "#9B59B6",
            order,
            isVisiblerue,
            isCustomalse,
          },
          {
            id: "other",
            name: "other",
            displayName: "Other",
            icon: "other",
            color: "#95A5A6",
            order,
            isVisiblerue,
            isCustomalse,
          },
        ],
        entries
          {
            id: "1",
            category: "quick-info",
            title: "Communication",
            description: "Non-verbal, uses AAC device",
            dateew Date(),
          },
          {
            id: "2",
            category: "quick-info",
            title: "Emergency Contact",
            description: "Mom55-0123, Dad55-0456",
            dateew Date(),
          },
          {
            id: "3",
            category: "daily-support",
            title: "Morning Routine",
            description:
              "Needs help with buttons, prefers to dress independently otherwise",
            dateew Date(),
          },
          {
            id: "4",
            category: "daily-support",
            title: "Sensory Needs",
            description:
              "Sensitive to loud noises, uses noise-canceling headphones",
            dateew Date(),
          },
          {
            id: "5",
            category: "daily-support",
            title: "Calming Strategies",
            description:
              "Deep pressure, weighted blanket, quiet space with dim lighting",
            dateew Date(),
          },
          {
            id: "6",
            category: "medical",
            title: "Daily Medications",
            description: "Melatonin 3mg at bedtime for sleep",
            dateew Date(),
          },
          {
            id: "7",
            category: "medical",
            title: "Allergies",
            description: "Peanuts - severe (carries EpiPen)",
            dateew Date(),
          },
          {
            id: "8",
            category: "development",
            title: "Current Goals",
            description: "Working on two-word phrases and turn-taking in play",
            dateew Date(),
          },
          {
            id: "9",
            category: "development",
            title: "Recent Achievement",
            description:
              "Successfully used AAC device to request snack independently",
            dateew Date(),
          },
          {
            id: "10",
            category: "health",
            title: "Sleep Pattern",
            description: "Bedtime 8pm, needs weighted blanket and white noise",
            dateew Date(),
          },
          {
            id: "11",
            category: "other",
            title: "Favorite Activities",
            description: "Loves music, puzzles, and water play",
            dateew Date(),
          },
        ],
        createdAtew Date(),
        updatedAtew Date(),
      };

      await AsyncStorage.setItem("childProfile", JSON.stringify(sampleProfile));
      // console.log('Sample profile initialized successfully');
      return sampleProfile;
    }

    return JSON.parse(existingProfile);
  } catch (error) {
    console.error("Error initializing sample data:", error);
    return [];
  }
};
