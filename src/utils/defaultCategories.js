export const defaultCategories = [
  // Original categories
  {
    id: "medical-history",
    name: "medical-history",
    displayName: "Medical History",
    color: "#E74C3C",
    order: 1,
    isCustom: false,
  },
  {
    id: "development-history",
    name: "development-history",
    displayName: "Development History",
    color: "#3498DB",
    order: 1,
    isCustom: false,
  },
  {
    id: "caretaker-history",
    name: "caretaker-history",
    displayName: "Caretaker History",
    color: "#9B59B6",
    order: 1,
    isCustom: false,
  },
  {
    id: "goals",
    name: "goals",
    displayName: "Goals",
    color: "#2ECC71",
    order: 1,
    isCustom: false,
  },
  {
    id: "successes",
    name: "successes",
    displayName: "Successes",
    color: "#F39C12",
    order: 1,
    isCustom: false,
  },
  {
    id: "strengths",
    name: "strengths",
    displayName: "Strengths",
    color: "#16A085",
    order: 1,
    isCustom: false,
  },
  {
    id: "challenges",
    name: "challenges",
    displayName: "Challenges",
    color: "#E67E22",
    order: 1,
    isCustom: false,
  },
  {
    id: "phrases",
    name: "phrases",
    displayName: "Phrases",
    color: "#8E44AD",
    order: 1,
    isCustom: false,
  },
  {
    id: "tips-tricks",
    name: "tips-tricks",
    displayName: "Tips  Tricks",
    color: "#27AE60",
    order: 1,
    isCustom: false,
  },
  {
    id: "daily-routine",
    name: "daily-routine",
    displayName: "Daily Routine",
    color: "#34495E",
    order: 10,
    isCustom: false,
  },
  {
    id: "education",
    name: "education",
    displayName: "Education",
    color: "#2980B9",
    order: 11,
    isCustom: false,
  },
  {
    id: "therapy",
    name: "therapy",
    displayName: "Therapy",
    color: "#1ABC9C",
    order: 12,
    isCustom: false,
  },
];
export function getCategoryByName(categories, name) {
  return categories.find((cat) => cat.name === name);
}
export function getVisibleCategories(categories) {
  // No longer filter by isVisible - categories auto-show when they have entries
  return categories
    .sort((a, b) => a.order - b.order);
}
