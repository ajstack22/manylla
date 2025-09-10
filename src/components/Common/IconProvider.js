/**
 * IconProvider - Unified icon system for cross-platform compatibility
 * Uses Material Icons on both web and native platforms
 * Following StackMap's implementation pattern
 */

import React from "react";
import { Platform, Text } from "react-native";

// Native icons from react-native-vector-icons
let MaterialIcons = null;
if (Platform.OS !== "web") {
  try {
    MaterialIcons = require("react-native-vector-icons/MaterialIcons").default;
  } catch (e) {
  }
}

// Web icons from Material-UI
let MUIIcons = {};
if (Platform.OS === "web") {
  MUIIcons = {
    // Navigation & Actions
    Menu: require("@mui/icons-material/Menu").default,
    Close: require("@mui/icons-material/Close").default,
    ArrowBack: require("@mui/icons-material/ArrowBack").default,
    MoreVert: require("@mui/icons-material/MoreVert").default,
    Search: require("@mui/icons-material/Search").default,
    Settings: require("@mui/icons-material/Settings").default,

    // Profile & User
    Person: require("@mui/icons-material/Person").default,
    PersonAdd: require("@mui/icons-material/PersonAdd").default,
    Edit: require("@mui/icons-material/Edit").default,
    Delete: require("@mui/icons-material/Delete").default,
    AccountCircle: require("@mui/icons-material/AccountCircle").default,

    // Content & Categories
    Add: require("@mui/icons-material/Add").default,
    AddCircle: require("@mui/icons-material/AddCircle").default,
    Category: require("@mui/icons-material/Category").default,
    LocalHospital: require("@mui/icons-material/LocalHospital").default,
    Psychology: require("@mui/icons-material/Psychology").default,
    Restaurant: require("@mui/icons-material/Restaurant").default,
    School: require("@mui/icons-material/School").default,
    Warning: require("@mui/icons-material/Warning").default,
    Home: require("@mui/icons-material/Home").default,

    // Communication & Sharing
    Share: require("@mui/icons-material/Share").default,
    Print: require("@mui/icons-material/Print").default,
    QrCode: require("@mui/icons-material/QrCode2").default,
    Link: require("@mui/icons-material/Link").default,
    ContentCopy: require("@mui/icons-material/ContentCopy").default,
    Download: require("@mui/icons-material/Download").default,

    // Sync & Cloud
    Sync: require("@mui/icons-material/Sync").default,
    Cloud: require("@mui/icons-material/Cloud").default,
    CloudSync: require("@mui/icons-material/CloudSync").default,
    CloudUpload: require("@mui/icons-material/CloudUpload").default,
    CloudDownload: require("@mui/icons-material/CloudDownload").default,

    // Labels & Tags
    Label: require("@mui/icons-material/Label").default,
    LabelOutline: require("@mui/icons-material/LabelOutlined").default,
    Tag: require("@mui/icons-material/Tag").default,

    // Auth & Security
    Logout: require("@mui/icons-material/Logout").default,
    Lock: require("@mui/icons-material/Lock").default,
    LockOpen: require("@mui/icons-material/LockOpen").default,
    Security: require("@mui/icons-material/Security").default,

    // Theme & Display
    DarkMode: require("@mui/icons-material/DarkMode").default,
    LightMode: require("@mui/icons-material/LightMode").default,
    Palette: require("@mui/icons-material/Palette").default,
    Brightness6: require("@mui/icons-material/Brightness6").default,

    // Status & Feedback
    CheckCircle: require("@mui/icons-material/CheckCircle").default,
    Error: require("@mui/icons-material/Error").default,
    Info: require("@mui/icons-material/Info").default,
    CheckBox: require("@mui/icons-material/CheckBox").default,
    CheckBoxOutlineBlank: require("@mui/icons-material/CheckBoxOutlineBlank")
      .default,
    RadioButtonChecked: require("@mui/icons-material/RadioButtonChecked")
      .default,
    RadioButtonUnchecked: require("@mui/icons-material/RadioButtonUnchecked")
      .default,

    // Time & Date
    CalendarToday: require("@mui/icons-material/CalendarToday").default,
    Schedule: require("@mui/icons-material/Schedule").default,
    Event: require("@mui/icons-material/Event").default,

    // Files & Documents
    Description: require("@mui/icons-material/Description").default,
    Folder: require("@mui/icons-material/Folder").default,
    InsertDriveFile: require("@mui/icons-material/InsertDriveFile").default,

    // Movement & Navigation
    ExpandMore: require("@mui/icons-material/ExpandMore").default,
    ExpandLess: require("@mui/icons-material/ExpandLess").default,
    ChevronRight: require("@mui/icons-material/ChevronRight").default,
    ChevronLeft: require("@mui/icons-material/ChevronLeft").default,
    ArrowUpward: require("@mui/icons-material/ArrowUpward").default,
    ArrowDownward: require("@mui/icons-material/ArrowDownward").default,
    DragHandle: require("@mui/icons-material/DragHandle").default,

    // Visibility
    Visibility: require("@mui/icons-material/Visibility").default,
    VisibilityOff: require("@mui/icons-material/VisibilityOff").default,

    // Additional
    Help: require("@mui/icons-material/Help").default,
    HelpOutline: require("@mui/icons-material/HelpOutline").default,
    Notifications: require("@mui/icons-material/Notifications").default,
    NotificationsOff: require("@mui/icons-material/NotificationsOff").default,
    Refresh: require("@mui/icons-material/Refresh").default,
    Save: require("@mui/icons-material/Save").default,
    Cancel: require("@mui/icons-material/Cancel").default,
    Done: require("@mui/icons-material/Done").default,
  };
}

// Map of icon names for react-native-vector-icons
const iconNameMap = {
  Menu: "menu",
  Close: "close",
  ArrowBack: "arrow-back",
  MoreVert: "more-vert",
  Search: "search",
  Settings: "settings",
  Person: "person",
  PersonAdd: "person-add",
  Edit: "edit",
  Delete: "delete",
  AccountCircle: "account-circle",
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
  Label: "label",
  LabelOutline: "label-outline",
  Tag: "local-offer",
  Logout: "logout",
  Lock: "lock",
  LockOpen: "lock-open",
  Security: "security",
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
  Notifications: "notifications",
  NotificationsOff: "notifications-off",
  Refresh: "refresh",
  Save: "save",
  Cancel: "cancel",
  Done: "done",
};

// Base Icon Component
const Icon = ({ name, size = 24, color = "#000000", style, ...props }) => {
  if (Platform.OS === "web" && MUIIcons[name]) {
    const IconComponent = MUIIcons[name];
    return (
      <IconComponent style={{ fontSize: size, color, ...style }} {...props} />
    );
  }

  if (Platform.OS !== "web" && MaterialIcons && iconNameMap[name]) {
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
export const DarkModeIcon = (props) => <Icon name="DarkMode" {...props} />;
export const LightModeIcon = (props) => <Icon name="LightMode" {...props} />;
export const PaletteIcon = (props) => <Icon name="Palette" {...props} />;

export default Icon;
