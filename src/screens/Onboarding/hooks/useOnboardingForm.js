import { useState } from 'react';

/**
 * Custom hook for managing onboarding form state and navigation
 * Handles step progression and form field state
 */
export const useOnboardingForm = () => {
  const [step, setStep] = useState(0);
  const [accessCode, setAccessCode] = useState('');
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  const goToStep = (stepNumber) => setStep(stepNumber);

  const clearError = () => setErrorMessage('');

  const isNameValid = () => childName.trim().length > 0;

  return {
    // State
    step,
    accessCode,
    childName,
    dateOfBirth,
    errorMessage,

    // Setters
    setAccessCode,
    setChildName,
    setDateOfBirth,
    setErrorMessage,

    // Actions
    nextStep,
    prevStep,
    goToStep,
    clearError,

    // Validation
    isNameValid,
  };
};
