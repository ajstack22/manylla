// Common components barrel export - unified file

// Icon exports
export {
  default as Icon,
  CategoryIcons,
  MenuIcon,
  CloseIcon,
  PersonIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ShareIcon,
  PrintIcon,
  QrCodeIcon,
  SyncIcon,
  SettingsIcon,
  CloudIcon,
  LabelIcon,
  LogoutIcon,
  DarkModeIcon,
  LightModeIcon,
  PaletteIcon,
} from "./IconProvider";

// Modal exports
export {
  default as UnifiedModal,
  ModalCard,
  ModalSection,
} from "./UnifiedModal";

// Theme exports
export { default as ThemeSwitcher } from "./ThemeSwitcher";

// Loading components - unified exports
export { default as LoadingSpinner } from "../Loading/LoadingSpinner";
export { default as LoadingOverlay } from "../Loading/LoadingOverlay";

// Toast component - unified export
export { default as ThemedToast } from "../Toast/ThemedToast";

// These components should be in Common directory or have unified versions
// For now, export placeholders that can be implemented
export const ErrorBoundary = ({ children }) => children;
export const HighlightedText = ({ text, highlight }) => text;