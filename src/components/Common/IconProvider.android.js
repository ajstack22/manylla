/**
 * IconProvider - Android-specific implementation
 * Uses react-native-vector-icons for Android platform
 * NO MUI IMPORTS to prevent crashes
 */

import React from "react";
import { Text } from "react-native";

// Native icons from react-native-vector-icons
let MaterialIcons = null;
try {
  MaterialIcons = require("react-native-vector-icons/MaterialIcons").default;
} catch (e) {
  // Expected failure if react-native-vector-icons is not available
  // App will gracefully fall back to text-based icons
}

// Map of icon names for react-native-vector-icons
const iconNameMap = {
  Menu: "menu",
  Close: "close",
  ArrowBack: "arrow-back",
  MoreVert: "more-vert",
  MoreHoriz: "more-horiz",
  Search: "search",
  Settings: "settings",
  Person: "person",
  PersonAdd: "person-add",
  Edit: "edit",
  Delete: "delete",
  AccountCircle: "account-circle",
  CameraAlt: "camera-alt",
  Add: "add",
  AddCircle: "add-circle",
  Category: "category",
  LocalHospital: "local-hospital",
  Psychology: "psychology",
  Restaurant: "restaurant",
  School: "school",
  Warning: "warning",
  Home: "home",
  Share: "share",
  Print: "print",
  QrCode: "qr-code",
  Link: "link",
  ContentCopy: "content-copy",
  Download: "file-download",
  Sync: "sync",
  Cloud: "cloud",
  CloudSync: "cloud-sync",
  CloudUpload: "cloud-upload",
  CloudDownload: "cloud-download",
  CloudDone: "cloud-done",
  Label: "label",
  LabelOutline: "label-outline",
  Tag: "local-offer",
  Logout: "logout",
  Lock: "lock",
  LockOpen: "lock-open",
  Security: "security",
  PrivacyTip: "privacy-tip",
  DarkMode: "dark-mode",
  LightMode: "light-mode",
  Palette: "palette",
  Brightness6: "brightness-6",
  CheckCircle: "check-circle",
  Error: "error",
  Info: "info",
  CheckBox: "check-box",
  CheckBoxOutlineBlank: "check-box-outline-blank",
  RadioButtonChecked: "radio-button-checked",
  RadioButtonUnchecked: "radio-button-unchecked",
  CalendarToday: "calendar-today",
  Schedule: "schedule",
  Event: "event",
  Description: "description",
  Folder: "folder",
  InsertDriveFile: "insert-drive-file",
  ExpandMore: "expand-more",
  ExpandLess: "expand-less",
  ChevronRight: "chevron-right",
  ChevronLeft: "chevron-left",
  ArrowUpward: "arrow-upward",
  ArrowDownward: "arrow-downward",
  DragHandle: "drag-handle",
  Visibility: "visibility",
  VisibilityOff: "visibility-off",
  Help: "help",
  HelpOutline: "help-outline",
  Favorite: "favorite",
  Notifications: "notifications",
  NotificationsOff: "notifications-off",
  Refresh: "refresh",
  Save: "save",
  Cancel: "cancel",
  Done: "done",
  PlaylistAddCheck: "playlist-add-check",
};

// Base Icon Component
const Icon = ({ name, size = 24, color = "#000000", style, ...props }) => {
  if (MaterialIcons && iconNameMap[name]) {
    return (
      <MaterialIcons
        name={iconNameMap[name]}
        size={size}
        color={color}
        style={style}
        {...props}
      />
    );
  }

  // Fallback to text when icon library not available
  return <Text style={{ fontSize: size * 0.8, color, ...style }}>○</Text>;
};

// Category Icons mapping
export const CategoryIcons = {
  goals: { name: "Psychology", component: Icon },
  strengths: { name: "CheckCircle", component: Icon },
  challenges: { name: "Warning", component: Icon },
  medical: { name: "LocalHospital", component: Icon },
  behavior: { name: "Psychology", component: Icon },
  diet: { name: "Restaurant", component: Icon },
  education: { name: "School", component: Icon },
  dailyRoutines: { name: "Schedule", component: Icon },
  communication: { name: "Psychology", component: Icon },
  family: { name: "Home", component: Icon },
  milestones: { name: "CheckCircle", component: Icon },
  sensory: { name: "Psychology", component: Icon },
  therapy: { name: "LocalHospital", component: Icon },
  medications: { name: "LocalHospital", component: Icon },
  notes: { name: "Description", component: Icon },
};

// Export named icons as components for convenience
export const MenuIcon = (props) => <Icon name="Menu" {...props} />;
export const CloseIcon = (props) => <Icon name="Close" {...props} />;
export const PersonIcon = (props) => <Icon name="Person" {...props} />;
export const AddIcon = (props) => <Icon name="Add" {...props} />;
export const EditIcon = (props) => <Icon name="Edit" {...props} />;
export const DeleteIcon = (props) => <Icon name="Delete" {...props} />;
export const ShareIcon = (props) => <Icon name="Share" {...props} />;
export const PrintIcon = (props) => <Icon name="Print" {...props} />;
export const QrCodeIcon = (props) => <Icon name="QrCode" {...props} />;
export const SyncIcon = (props) => <Icon name="Sync" {...props} />;
export const SettingsIcon = (props) => <Icon name="Settings" {...props} />;
export const CloudIcon = (props) => <Icon name="Cloud" {...props} />;
export const LabelIcon = (props) => <Icon name="Label" {...props} />;
export const LogoutIcon = (props) => <Icon name="Logout" {...props} />;
export const PrivacyTipIcon = (props) => <Icon name="PrivacyTip" {...props} />;
export const DarkModeIcon = (props) => <Icon name="DarkMode" {...props} />;
export const LightModeIcon = (props) => <Icon name="LightMode" {...props} />;
export const PaletteIcon = (props) => <Icon name="Palette" {...props} />;
export const SupportIcon = (props) => <Icon name="Favorite" {...props} />;
export const ChevronUpIcon = (props) => <Icon name="ExpandLess" {...props} />;
export const ChevronDownIcon = (props) => <Icon name="ExpandMore" {...props} />;
export const MoreHorizIcon = (props) => <Icon name="MoreHoriz" {...props} />;
export const DescriptionIcon = (props) => (
  <Icon name="Description" {...props} />
);
export const InsertDriveFileIcon = (props) => (
  <Icon name="InsertDriveFile" {...props} />
);
export const DownloadIcon = (props) => <Icon name="Download" {...props} />;
export const CheckCircleIcon = (props) => (
  <Icon name="CheckCircle" {...props} />
);
export const ContentCopyIcon = (props) => (
  <Icon name="ContentCopy" {...props} />
);
export const DoneIcon = (props) => <Icon name="Done" {...props} />;
export const LockIcon = (props) => <Icon name="Lock" {...props} />;
export const SchoolIcon = (props) => <Icon name="School" {...props} />;
export const LocalHospitalIcon = (props) => (
  <Icon name="LocalHospital" {...props} />
);
export const HomeIcon = (props) => <Icon name="Home" {...props} />;
export const UploadIcon = (props) => <Icon name="CloudUpload" {...props} />;
export const CloudUploadIcon = (props) => (
  <Icon name="CloudUpload" {...props} />
);
export const CloudDownloadIcon = (props) => (
  <Icon name="CloudDownload" {...props} />
);
export const CloudDoneIcon = (props) => <Icon name="CloudDone" {...props} />;
export const CloudSyncIcon = (props) => <Icon name="CloudSync" {...props} />;
export const PlaylistAddCheckIcon = (props) => (
  <Icon name="PlaylistAddCheck" {...props} />
);

export default Icon;