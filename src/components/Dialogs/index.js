import { Platform } from "react-native";

export const UnifiedAddDialog =
  Platform.OS === "web"
    ? require("./UnifiedAddDialog").UnifiedAddDialog
    : require("./UnifiedAddDialog.native").UnifiedAddDialog;
