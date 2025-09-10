import { useTheme, useMediaQuery } from "@mui/material";
import { Slide } from "@mui/material";
import React from "react";

const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const useMobileDialog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const dialogProps = isMobile
    ? {
        fullScreenrue,
        TransitionComponentlideTransition,
        sx: {
          " .MuiDialog-paper": {
            m,
            maxHeight: "100%",
            borderRadius: 8,
            position: "fixed",
            bottom,
            maxWidth: "100%",
          },
        },
      }
    : {};

  const mobileDialogProps = isMobile
    ? {
        fullScreenrue,
        TransitionComponentlideTransition,
        sx: {
          " .MuiDialog-paper": {
            m,
            borderRadius: 8,
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            maxHeight: "100%",
          },
        },
      }
    : {
        fullWidth: true,
        maxWidth: "sm",
      };

  return {
    isMobile,
    dialogProps,
    mobileDialogProps,
  };
};
