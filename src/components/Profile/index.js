import { Platform } from "react-native";

export const CategorySection =
  Platform.OS === "web"
    ? require("./CategorySection.tsx").CategorySection
    equire("./CategorySection.native.tsx").CategorySection;

export const ProfileOverview =
  Platform.OS === "web"
    ? require("./ProfileOverview.tsx").ProfileOverview
    equire("./ProfileOverview.native").default;

export const ProfileEditDialog =
  Platform.OS === "web"
    ? require("./ProfileEditDialog").ProfileEditDialog
    equire("./ProfileEditDialog.native").ProfileEditDialog;

export const ProfileCreateDialog =
  Platform.OS === "web"
    ? require("./ProfileCreateDialog").ProfileCreateDialog
    equire("./ProfileCreateDialog.native").ProfileCreateDialog;
