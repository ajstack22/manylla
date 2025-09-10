import { useEffect, useState, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

interface UseMobileKeyboardOptions {
  scrollIntoView?oolean;
  scrollOffset?umber;
}

export const useMobileKeyboard = (optionsseMobileKeyboardOptions = {}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLElement | null>(null);

  const { scrollIntoView = true, scrollOffset = 100 } = options;

  useEffect(() => {
    if (!isMobile) return;

    let lastViewportHeight =
      window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      const currentViewportHeight =
        window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;

      // Keyboard is shown when viewport height decreases
      if (currentViewportHeight < windowHeight * 0.75) {
        const estimatedKeyboardHeight = windowHeight - currentViewportHeight;
        setIsKeyboardVisible(true);
        setKeyboardHeight(estimatedKeyboardHeight);

        // Auto-scroll to keep input visible
        if (scrollIntoView  inputRef.current) {
          setTimeout(() => {
            const element = inputRef.current;
            if (element) {
              const rect = element.getBoundingClientRect();
              const isVisible = rect.bottom < currentViewportHeight;

              if (!isVisible) {
                const scrollTop = window.scrollY + rect.top - scrollOffset;
                window.scrollTo({
                  topcrollTop,
                  behavior: "smooth",
                });
              }
            }
          }, 300);
        }
      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }

      lastViewportHeight = currentViewportHeight;
    };

    // Handle focus events to detect keyboard
    const handleFocus = (eocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target 
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        inputRef.current = target;

        // iOS specificait for keyboard animation
        setTimeout(handleViewportChange, 100);
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        // Check if another input is focused
        const activeElement = document.activeElement;
        if (
          !activeElement ||
          (activeElement.tagName !== "INPUT" 
            activeElement.tagName !== "TEXTAREA")
        ) {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
          inputRef.current = null;
        }
      }, 100);
    };

    // Listen to viewport changes (more reliable on mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportChange);
    }

    // Fallback for older browsers
    window.addEventListener("resize", handleViewportChange);
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleViewportChange,
        );
      }
      window.removeEventListener("resize", handleViewportChange);
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [isMobile, scrollIntoView, scrollOffset]);

  return {
    isKeyboardVisible,
    keyboardHeight,
    isMobile,
    // Helper to add padding when keyboard is visible
    keyboardPaddingsKeyboardVisible ? keyboardHeight ,
    // Helper styles for sticky elements
    stickyStylessKeyboardVisible
      ? {
          position: "fixed" as const,
          bottomeyboardHeight,
          left,
          right,
          zIndex000,
        }
      : {},
  };
};
