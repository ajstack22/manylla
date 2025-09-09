import { QuickInfoConfig } from "../types/ChildProfile";

export const defaultQuickInfoPanels: QuickInfoConfig[] = [
  {
    id: "communication",
    name: "communication",
    displayName: "Communication",
    value: "",
    order: 1,
    isVisible: true,
    isCustom: false,
  },
  {
    id: "sensory",
    name: "sensory",
    displayName: "Sensory",
    value: "",
    order: 2,
    isVisible: true,
    isCustom: false,
  },
  {
    id: "medical",
    name: "medical",
    displayName: "Medical",
    value: "",
    order: 3,
    isVisible: true,
    isCustom: false,
  },
  {
    id: "dietary",
    name: "dietary",
    displayName: "Dietary",
    value: "",
    order: 4,
    isVisible: true,
    isCustom: false,
  },
  {
    id: "emergency",
    name: "emergency",
    displayName: "Emergency",
    value: "",
    order: 5,
    isVisible: true,
    isCustom: false,
  },
  {
    id: "medications",
    name: "medications",
    displayName: "Medications",
    value: "",
    order: 6,
    isVisible: false,
    isCustom: false,
  },
  {
    id: "allergies",
    name: "allergies",
    displayName: "Allergies",
    value: "",
    order: 7,
    isVisible: false,
    isCustom: false,
  },
  {
    id: "behaviors",
    name: "behaviors",
    displayName: "Behaviors",
    value: "",
    order: 8,
    isVisible: false,
    isCustom: false,
  },
  {
    id: "triggers",
    name: "triggers",
    displayName: "Triggers",
    value: "",
    order: 9,
    isVisible: false,
    isCustom: false,
  },
  {
    id: "calming",
    name: "calming",
    displayName: "Calming Strategies",
    value: "",
    order: 10,
    isVisible: false,
    isCustom: false,
  },
  {
    id: "sleep",
    name: "sleep",
    displayName: "Sleep",
    value: "",
    order: 11,
    isVisible: false,
    isCustom: false,
  },
  {
    id: "routine",
    name: "routine",
    displayName: "Daily Routine",
    value: "",
    order: 12,
    isVisible: false,
    isCustom: false,
  },
];

export function getVisibleQuickInfo(
  panels: QuickInfoConfig[],
): QuickInfoConfig[] {
  return panels
    .filter((panel) => panel.isVisible)
    .sort((a, b) => a.order - b.order);
}

export function getQuickInfoByName(
  panels: QuickInfoConfig[],
  name: string,
): QuickInfoConfig | undefined {
  return panels.find((panel) => panel.name === name);
}
