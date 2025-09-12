import { Dimensions } from "react-native";
import platform from "../utils/platform";

export const useMobileDialog = () => {
  const { width } = Dimensions.get("window");
  const isMobile = width < 600; // Breakpoint equivalent to Material-UI sm

  const dialogProps = isMobile
    ? {
        fullScreen: true,
        animationType: "slide",
        presentationStyle: "formSheet",
        style: {
          margin: 0,
          maxHeight: "100%",
          borderRadius: platform.isIOS ? 12 : 8,
          maxWidth: "100%",
        },
      }
    : {
        animationType: "fade",
        transparent: true,
        style: {
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      };

  const mobileDialogProps = isMobile
    ? {
        fullScreen: true,
        animationType: "slide",
        presentationStyle: "formSheet",
        style: {
          margin: 0,
          borderRadius: platform.isIOS ? 12 : 8,
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          maxHeight: "100%",
        },
      }
    : {
        animationType: "fade",
        transparent: true,
        style: {
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          maxWidth: 480,
        },
      };

  return {
    isMobile,
    dialogProps,
    mobileDialogProps,
  };
};
