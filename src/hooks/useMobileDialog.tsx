import { useTheme, useMediaQuery } from "@mui/material";
import { Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const useMobileDialog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const dialogProps = isMobile
    ? {
        fullScreen: true,
        TransitionComponent: SlideTransition,
        sx: {
          "& .MuiDialog-paper": {
            m: 0,
            maxHeight: "100%",
            borderRadius: 0,
            position: "fixed",
            bottom: 0,
            maxWidth: "100%",
          },
        },
      }
    : {};

  const mobileDialogProps = isMobile
    ? {
        fullScreen: true,
        TransitionComponent: SlideTransition,
        sx: {
          "& .MuiDialog-paper": {
            m: 0,
            borderRadius: 0,
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            maxHeight: "100%",
          },
        },
      }
    : {
        fullWidth: true,
        maxWidth: "sm" as const,
      };

  return {
    isMobile,
    dialogProps,
    mobileDialogProps,
  };
};
