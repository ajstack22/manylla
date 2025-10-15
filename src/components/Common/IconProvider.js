/**
 * IconProvider - Unified icon system for cross-platform compatibility
 * Uses Material Icons on both web and native platforms
 * Following StackMap's implementation pattern
 */

import React from "react";
import { Text } from "react-native";
import platform from "../../utils/platform";

// Native icons from react-native-vector-icons
let MaterialIcons = null;
if (platform.isMobile) {
  try {
    MaterialIcons = require("react-native-vector-icons/MaterialIcons").default;
  } catch (e) {
    // Expected failure on platforms where react-native-vector-icons is not available
    // App will gracefully fall back to text-based icons
    if (process.env.NODE_ENV === "development") {
      console.warn("IconProvider: Failed to load MaterialIcons, using fallback icons", e.message);
    }
  }
}

// Web icons from Material-UI - only load on web platform
let MUIIcons = {};
// CRITICAL: Only load MUI on web to prevent Android crashes
if (typeof platform.isWeb !== 'undefined' && platform.isWeb === true) {
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
    CameraAlt: require("@mui/icons-material/CameraAlt").default,

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
    CloudDone: require("@mui/icons-material/CloudDone").default,

    // Labels & Tags
    Label: require("@mui/icons-material/Label").default,
    LabelOutline: require("@mui/icons-material/LabelOutlined").default,
    Tag: require("@mui/icons-material/Tag").default,

    // Auth & Security
    Logout: require("@mui/icons-material/Logout").default,
    Lock: require("@mui/icons-material/Lock").default,
    LockOpen: require("@mui/icons-material/LockOpen").default,
    Security: require("@mui/icons-material/Security").default,
    PrivacyTip: require("@mui/icons-material/PrivacyTip").default,

    // Theme & Display
    DarkMode: require("@mui/icons-material/DarkMode").default,
    LightMode: require("@mui/icons-material/LightMode").default,
    Palette: require("@mui/icons-material/Palette").default,
    Brightness6: require("@mui/icons-material/Brightness6").default,

    // Status & Feedback
    CheckCircle: require("@mui/icons-material/CheckCircle").default,
    Error: require("@mui/icons-material/Error").default,
    Info: require("@mui/icons-material/Info").default,
    Favorite: require("@mui/icons-material/Favorite").default,

    // Additional icons for categories
    TrendingUp: require("@mui/icons-material/TrendingUp").default,
    People: require("@mui/icons-material/People").default,
    Flag: require("@mui/icons-material/Flag").default,
    Star: require("@mui/icons-material/Star").default,
    FitnessCenter: require("@mui/icons-material/FitnessCenter").default,
    ChatBubble: require("@mui/icons-material/ChatBubble").default,
    Lightbulb: require("@mui/icons-material/Lightbulb").default,
    Today: require("@mui/icons-material/Today").default,
    Healing: require("@mui/icons-material/Healing").default,
    ContactPhone: require("@mui/icons-material/ContactPhone").default,
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
    MoreHoriz: require("@mui/icons-material/MoreHoriz").default,
    PlaylistAddCheck: require("@mui/icons-material/PlaylistAddCheck").default,
  };
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
  if (platform.isWeb && MUIIcons[name]) {
    const IconComponent = MUIIcons[name];
    return (
      <IconComponent style={{ fontSize: size, color, ...style }} {...props} />
    );
  }

  if (platform.isMobile && MaterialIcons && iconNameMap[name]) {
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

  // Improved fallback with better icon characters
  const fallbackIcons = {
    Menu: "☰",
    Close: "✕",
    ArrowBack: "←",
    MoreVert: "⋮",
    Settings: "⚙",
    Person: "👤",
    Edit: "✏",
    Delete: "🗑",
    CameraAlt: "📷",
    Add: "+",
    Share: "↗",
    Print: "🖨",
    Cloud: "☁",
    Visibility: "👁",
    VisibilityOff: "👁‍🗨",
    Lock: "🔒",
    LockOpen: "🔓",
    Palette: "🎨",
    BrightnessLow: "🌙",
    BrightnessHigh: "☀",
    HelpOutline: "❓",
    CheckCircle: "✓",
    Warning: "⚠",
    Error: "✖",
    Info: "ℹ",
  };

  const fallbackChar = fallbackIcons[name] || "○";

  if (process.env.NODE_ENV === "development" && !fallbackIcons[name]) {
    console.warn(`IconProvider: No fallback icon for "${name}"`);
  }

  return <Text style={{ fontSize: size * 0.8, color, ...style }}>{fallbackChar}</Text>;
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
export const MoreVertIcon = (props) => <Icon name="MoreVert" {...props} />;
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
