import platform from "@platform";

export const UnifiedAddDialog = platform.isWeb
  ? require("./UnifiedAddDialog").UnifiedAddDialog
  : require("./UnifiedAddDialog.native").UnifiedAddDialog;
