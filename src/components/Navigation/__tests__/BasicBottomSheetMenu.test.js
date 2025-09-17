/**
 * Basic BottomSheetMenu Import Test
 * Just to verify the component can be imported
 */

import React from "react";

// Mock everything needed for basic import
jest.mock("../Common", () => ({
  ShareIcon: () => "ShareIcon",
  PrintIcon: () => "PrintIcon",
  CloudIcon: () => "CloudIcon",
  PaletteIcon: () => "PaletteIcon",
  PrivacyTipIcon: () => "PrivacyTipIcon",
  SupportIcon: () => "SupportIcon",
  LogoutIcon: () => "LogoutIcon",
  CloseIcon: () => "CloseIcon",
}));

jest.mock("../../../utils/platform", () => ({
  isWeb: true,
  isAndroid: false,
  isIOS: false,
  isMobile: false,
  select: (obj) => obj.web || obj.default,
}));

jest.mock("@mui/icons-material/ExpandLess", () => ({
  default: () => "ExpandLess",
}));

jest.mock("@mui/icons-material/ExpandMore", () => ({
  default: () => "ExpandMore",
}));

import BottomSheetMenu from "../BottomSheetMenu";

describe("BottomSheetMenu Import Test", () => {
  test("should be able to import the component", () => {
    expect(BottomSheetMenu).toBeDefined();
    expect(typeof BottomSheetMenu).toBe("function");
  });
});