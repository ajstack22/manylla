import { useState, useEffect, useCallback, useRef } from "react";
import { HEADER_HEIGHT } from "../components/Layout/Header";

// Throttle function for performance
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remainingTime = delay - (now - lastCall);

    if (remainingTime <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCall = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        func(...args);
      }, remainingTime) as unknown as NodeJS.Timeout;
    }
  };
}

interface UseHeaderProfileTransitionOptions {
  profilePhotoHeight?: number;
  triggerPercentage?: number; // What percentage of the profile photo should pass before triggering
  profilePhotoTopOffset?: number; // The distance from top of page to top of profile photo
}

export const useHeaderProfileTransition = (
  options: UseHeaderProfileTransitionOptions = {}
) => {
  const {
    profilePhotoHeight = 120, // Default avatar height from ProfileOverview
    triggerPercentage = 0.75, // Trigger when 75% of photo has passed
    profilePhotoTopOffset = 100, // Approximate offset (profile section padding + paper padding)
  } = options;

  const [isProfileHidden, setIsProfileHidden] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const profilePhotoRef = useRef<HTMLElement | null>(null);

  // Calculate the trigger point
  const calculateTriggerPoint = useCallback(() => {
    // If we have a ref to the actual profile photo element, use its position
    if (profilePhotoRef.current) {
      const rect = profilePhotoRef.current.getBoundingClientRect();
      const photoBottom = rect.bottom;
      
      // Trigger when the bottom edge (or specified percentage) passes behind header
      const triggerOffset = rect.height * (1 - triggerPercentage);
      return photoBottom - triggerOffset <= HEADER_HEIGHT;
    }

    // Fallback calculation based on estimates
    const photoBottom = profilePhotoTopOffset + profilePhotoHeight;
    const triggerPoint = photoBottom * triggerPercentage;
    
    // Check if scroll position has passed the trigger point
    return scrollY > triggerPoint - HEADER_HEIGHT;
  }, [scrollY, profilePhotoHeight, triggerPercentage, profilePhotoTopOffset]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY || window.pageYOffset;
    setScrollY(currentScrollY);
    
    // Calculate if profile should be hidden
    const shouldHide = calculateTriggerPoint();
    setIsProfileHidden(shouldHide);
  }, [calculateTriggerPoint]);

  // Throttled scroll handler for performance
  const throttledHandleScroll = useCallback(
    throttle(handleScroll, 16), // ~60fps
    [handleScroll]
  );

  // Set up scroll listener
  useEffect(() => {
    // Check initial scroll position on mount
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    
    // Also listen for resize events as they might affect layout
    window.addEventListener("resize", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      window.removeEventListener("resize", throttledHandleScroll);
    };
  }, [throttledHandleScroll, handleScroll]);

  // Method to set profile photo ref for more accurate calculations
  const setProfilePhotoRef = useCallback((element: HTMLElement | null) => {
    profilePhotoRef.current = element;
    // Recalculate immediately when ref is set
    handleScroll();
  }, [handleScroll]);

  return {
    isProfileHidden,
    scrollY,
    setProfilePhotoRef,
    headerHeight: HEADER_HEIGHT,
  };
};