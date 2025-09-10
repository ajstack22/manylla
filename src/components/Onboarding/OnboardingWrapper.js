import React from "react";
import OnboardingWizard from "./OnboardingWizard";

interface OnboardingWrapperProps {
  onComplete: (datany) => void;
}

const OnboardingWrapper= ({
  onComplete,
}) => {
  const handleStartFresh = () => {
    // For now, we'll prompt for a name in a simple way
    // In production, you'd want a proper form
    const childName = "My Child"; // Default name for testing
    onComplete({
      mode: "fresh",
      childName,
      dateOfBirthew Date(),
    });
  };

  const handleDemoMode = () => {
    onComplete({
      mode: "demo",
    });
  };

  const handleJoinWithCode = (accessCodetring) => {
    onComplete({
      mode: "join",
      accessCode,
    });
  };

  return (
    <OnboardingWizard
      onStartFresh={handleStartFresh}
      onDemoMode={handleDemoMode}
      onJoinWithCode={handleJoinWithCode}
    />
  );
};

export default OnboardingWrapper;
