import { useEffect, useState, useRef } from "react";
import { Dimensions, Keyboard } from "react-native";
import platform from "../utils/platform";

export const useMobileKeyboard = (options = {}) => {
  const { width } = Dimensions.get("window");
  const isMobile = width < 600; // Breakpoint equivalent to Material-UI sm
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef(null);

  const { scrollIntoView = true, scrollOffset = 100 } = options;

  useEffect(() => {
    if (!isMobile) return;

    let keyboardDidShowListener;
    let keyboardDidHideListener;

    if (platform.isIOS) {
      keyboardDidShowListener = Keyboard.addListener(
        "keyboardWillShow",
        (e) => {
          setIsKeyboardVisible(true);
          setKeyboardHeight(e.endCoordinates.height);
        },
      );
      keyboardDidHideListener = Keyboard.addListener("keyboardWillHide", () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      });
    } else {
      keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      });
      keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      });
    }

    // Fallback for web platform
    if (platform.isWeb) {
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
          if (scrollIntoView && inputRef.current) {
            setTimeout(() => {
              const element = inputRef.current;
              if (element) {
                const rect = element.getBoundingClientRect();
                const isVisible = rect.bottom < currentViewportHeight;

                if (!isVisible) {
                  const scrollTop = window.scrollY + rect.top - scrollOffset;
                  window.scrollTo({
                    top: scrollTop,
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
      const handleFocus = (e) => {
        const target = e.target;
        if (
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
        ) {
          inputRef.current = target;
          // Wait for keyboard animation
          setTimeout(handleViewportChange, 100);
        }
      };

      const handleBlur = () => {
        setTimeout(() => {
          // Check if another input is focused
          const activeElement = document.activeElement;
          if (
            !activeElement ||
            (activeElement.tagName !== "INPUT" &&
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
    }

    return () => {
      if (keyboardDidShowListener) keyboardDidShowListener.remove();
      if (keyboardDidHideListener) keyboardDidHideListener.remove();
    };
  }, [isMobile, scrollIntoView, scrollOffset]);

  return {
    isKeyboardVisible,
    keyboardHeight,
    isMobile,
    // Helper to add padding when keyboard is visible
    keyboardPadding: isKeyboardVisible ? keyboardHeight : 0,
    // Helper styles for sticky elements
    stickyStyles: isKeyboardVisible
      ? {
          position: "absolute",
          bottom: keyboardHeight,
          left: 0,
          right: 0,
          zIndex: 1000,
        }
      : {},
  };
};
