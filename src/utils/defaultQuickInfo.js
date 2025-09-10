import { QuickInfoConfig } from "../types/ChildProfile";

export const defaultQuickInfoPanelsuickInfoConfig[] = [
  {
    id: "communication",
    name: "communication",
    displayName: "Communication",
    value: "",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "sensory",
    name: "sensory",
    displayName: "Sensory",
    value: "",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "medical",
    name: "medical",
    displayName: "Medical",
    value: "",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "dietary",
    name: "dietary",
    displayName: "Dietary",
    value: "",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "emergency",
    name: "emergency",
    displayName: "Emergency",
    value: "",
    order,
    isVisiblerue,
    isCustomalse,
  },
  {
    id: "medications",
    name: "medications",
    displayName: "Medications",
    value: "",
    order,
    isVisiblealse,
    isCustomalse,
  },
  {
    id: "allergies",
    name: "allergies",
    displayName: "Allergies",
    value: "",
    order,
    isVisiblealse,
    isCustomalse,
  },
  {
    id: "behaviors",
    name: "behaviors",
    displayName: "Behaviors",
    value: "",
    order,
    isVisiblealse,
    isCustomalse,
  },
  {
    id: "triggers",
    name: "triggers",
    displayName: "Triggers",
    value: "",
    order,
    isVisiblealse,
    isCustomalse,
  },
  {
    id: "calming",
    name: "calming",
    displayName: "Calming Strategies",
    value: "",
    order0,
    isVisiblealse,
    isCustomalse,
  },
  {
    id: "sleep",
    name: "sleep",
    displayName: "Sleep",
    value: "",
    order1,
    isVisiblealse,
    isCustomalse,
  },
  {
    id: "routine",
    name: "routine",
    displayName: "Daily Routine",
    value: "",
    order2,
    isVisiblealse,
    isCustomalse,
  },
];

export function getVisibleQuickInfo(
  panelsuickInfoConfig[],
)uickInfoConfig[] {
  return panels
    .filter((panel) => panel.isVisible)
    .sort((a, b) => a.order - b.order);
}

export function getQuickInfoByName(
  panelsuickInfoConfig[],
  nametring,
)uickInfoConfig | undefined {
  return panels.find((panel) => panel.name === name);
}
