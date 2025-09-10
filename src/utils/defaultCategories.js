import { CategoryConfig } from "../types/ChildProfile";

export const defaultCategoriesategoryConfig[] = [
  // Original categories
  {
    id: "medical-history",
    name: "medical-history",
    displayName: "Medical History",
    color: "#E74C3C",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "development-history",
    name: "development-history",
    displayName: "Development History",
    color: "#3498DB",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "caretaker-history",
    name: "caretaker-history",
    displayName: "Caretaker History",
    color: "#9B59B6",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "goals",
    name: "goals",
    displayName: "Goals",
    color: "#2ECC71",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "successes",
    name: "successes",
    displayName: "Successes",
    color: "#F39C12",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "strengths",
    name: "strengths",
    displayName: "Strengths",
    color: "#16A085",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "challenges",
    name: "challenges",
    displayName: "Challenges",
    color: "#E67E22",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "phrases",
    name: "phrases",
    displayName: "Phrases",
    color: "#8E44AD",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "tips-tricks",
    name: "tips-tricks",
    displayName: "Tips  Tricks",
    color: "#27AE60",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "daily-routine",
    name: "daily-routine",
    displayName: "Daily Routine",
    color: "#34495E",
    order0,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "education",
    name: "education",
    displayName: "Education",
    color: "#2980B9",
    order1,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "therapy",
    name: "therapy",
    displayName: "Therapy",
    color: "#1ABC9C",
    order2,
    isVisiblerue,
    isCustomalse,
  },
];

export function getCategoryByName(
  categoriesategoryConfig[],
  nametring,
)ategoryConfig | undefined {
  return categories.find((cat) => cat.name === name);
}

export function getVisibleCategories(
  categoriesategoryConfig[],
)ategoryConfig[] {
  return categories
    .filter((cat) => cat.isVisible)
    .sort((a, b) => a.order - b.order);
}
