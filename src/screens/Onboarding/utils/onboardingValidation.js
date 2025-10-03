/**
 * Validation utilities for onboarding form
 */

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return "Please enter the child's name";
  }
  return null;
};

export const validateDateOfBirth = (date) => {
  // Date is optional, so no validation needed
  return null;
};

export const validatePhoto = (photo) => {
  // Photo is optional, validation happens during upload
  return null;
};

export const validateStep = (stepNumber, formData) => {
  switch (stepNumber) {
    case 1:
      return validateName(formData.childName);
    default:
      return null;
  }
};
