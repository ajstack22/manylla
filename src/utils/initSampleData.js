import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChildProfile } from "../types/ChildProfile";

export const initializeSampleData = async () => {
  try {
    const existingProfile = await AsyncStorage.getItem("childProfile");

    if (existingProfile === null) {
      const sampleProfile = {
        id: "1",
        name: "Alex Johnson",
        dateOfBirth: new Date("2015-01-01"),
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
            description: "Non-verbal, uses AAC device",
            date: new Date(),
          },
          {
            id: "2",
            category: "quick-info",
            title: "Emergency Contact",
            description: "Mom55-0123, Dad55-0456",
            date: new Date(),
          },
          {
            id: "3",
            category: "daily-support",
            title: "Morning Routine",
            description:
              "Needs help with buttons, prefers to dress independently otherwise",
            date: new Date(),
          },
          {
            id: "4",
            category: "daily-support",
            title: "Sensory Needs",
            description:
              "Sensitive to loud noises, uses noise-canceling headphones",
            date: new Date(),
          },
          {
            id: "5",
            category: "daily-support",
            title: "Calming Strategies",
            description:
              "Deep pressure, weighted blanket, quiet space with dim lighting",
            date: new Date(),
          },
          {
            id: "6",
            category: "medical",
            title: "Daily Medications",
            description: "Melatonin 3mg at bedtime for sleep",
            date: new Date(),
          },
          {
            id: "7",
            category: "medical",
            title: "Allergies",
            description: "Peanuts - severe (carries EpiPen)",
            date: new Date(),
          },
          {
            id: "8",
            category: "development",
            title: "Current Goals",
            description: "Working on two-word phrases and turn-taking in play",
            date: new Date(),
          },
          {
            id: "9",
            category: "development",
            title: "Recent Achievement",
            description:
              "Successfully used AAC device to request snack independently",
            date: new Date(),
          },
          {
            id: "10",
            category: "health",
            title: "Sleep Pattern",
            description: "Bedtime 8pm, needs weighted blanket and white noise",
            date: new Date(),
          },
          {
            id: "11",
            category: "other",
            title: "Favorite Activities",
            description: "Loves music, puzzles, and water play",
            date: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem("childProfile", JSON.stringify(sampleProfile));
      return sampleProfile;
    }

    return JSON.parse(existingProfile);
  } catch (error) {
    return [];
  }
};
