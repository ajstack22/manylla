import platform from "../../utils/platform";

export const UnifiedAddDialog = platform.isWeb
  ? require("./UnifiedAddDialog").UnifiedAddDialog
  : require("./UnifiedAddDialog.native").UnifiedAddDialog;
