import { useState, useEffect, useCallback, useRef } from "react";
import platform from "../utils/platform";
import { ErrorHandler } from "../utils/errors";
import { getErrorMessage } from "../utils/errorMessages";
import { showToast } from "../components/Toast/ToastManager";

/**
 * Custom hook for forms with automatic draft saving and error recovery
 * Provides validation, error handling, and draft recovery functionality
 */
export const useFormWithRecovery = (
  initialValues,
  validators = {},
  options = {},
) => {
  const {
    draftKey = "form_draft",
    autosaveDelay = 1000,
    validateOnChange = true,
    validateOnBlur = true,
    clearDraftOnSuccess = true,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [draft, setDraft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isDraftAvailable, setIsDraftAvailable] = useState(false);

  const autosaveTimer = useRef(null);
  const lastSavedDraft = useRef(null);

  // Load draft on mount
  useEffect(() => {
    loadDraft(); // eslint-disable-line no-use-before-define
  }, [loadDraft]); // eslint-disable-line no-use-before-define

  // Auto-save draft on value changes
  useEffect(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = setTimeout(() => {
      saveDraft(values); // eslint-disable-line no-use-before-define
    }, autosaveDelay);

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [values, autosaveDelay, saveDraft]); // eslint-disable-line no-use-before-define

  // Load draft from storage
  const loadDraft = useCallback(async () => {
    try {
      let savedDraft;

      if (platform.isWeb) {
        const draftString = localStorage.getItem(draftKey);
        savedDraft = draftString ? JSON.parse(draftString) : null;
      } else {
        // For React Native, would use AsyncStorage
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const draftString = await AsyncStorage.getItem(draftKey);
        savedDraft = draftString ? JSON.parse(draftString) : null;
      }

      if (savedDraft && savedDraft.timestamp) {
        // Check if draft is less than 24 hours old
        const draftAge = Date.now() - savedDraft.timestamp;
        if (draftAge < 24 * 60 * 60 * 1000) {
          setDraft(savedDraft.values);
          setIsDraftAvailable(true);
          lastSavedDraft.current = savedDraft.values;
        } else {
          // Clear old draft
          clearDraft(); // eslint-disable-line no-use-before-define
        }
      }
    } catch (error) {
      ErrorHandler.log(error, {
        context: "loadDraft",
        recoverable: true,
      });
    }
  }, [draftKey, clearDraft]); // eslint-disable-line no-use-before-define

  // Save draft to storage
  const saveDraft = useCallback(
    async (currentValues) => {
      try {
        // Don't save if values haven't changed
        if (
          JSON.stringify(currentValues) ===
          JSON.stringify(lastSavedDraft.current)
        ) {
          return;
        }

        const draftData = {
          values: currentValues,
          timestamp: Date.now(),
        };

        if (platform.isWeb) {
          localStorage.setItem(draftKey, JSON.stringify(draftData));
        } else {
          const AsyncStorage =
            require("@react-native-async-storage/async-storage").default;
          await AsyncStorage.setItem(draftKey, JSON.stringify(draftData));
        }

        lastSavedDraft.current = currentValues;
      } catch (error) {
        // Don't show error to user for draft save failures
        ErrorHandler.log(error, {
          context: "saveDraft",
          recoverable: true,
        });
      }
    },
    [draftKey],
  );

  // Clear draft from storage
  const clearDraft = useCallback(async () => {
    try {
      if (platform.isWeb) {
        localStorage.removeItem(draftKey);
      } else {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        await AsyncStorage.removeItem(draftKey);
      }

      setDraft(null);
      setIsDraftAvailable(false);
      lastSavedDraft.current = null;
    } catch (error) {
      ErrorHandler.log(error, {
        context: "clearDraft",
        recoverable: true,
      });
    }
  }, [draftKey]);

  // Restore draft values
  const restoreDraft = useCallback(() => {
    if (draft) {
      setValues(draft);
      setIsDraftAvailable(false);
      showToast("Draft restored", "success");
    }
  }, [draft]);

  // Discard draft
  const discardDraft = useCallback(() => {
    clearDraft();
    showToast("Draft discarded", "info");
  }, [clearDraft]);

  // Validate a single field
  const validateField = useCallback(
    (name, value) => {
      if (!validators[name]) {
        return null;
      }

      try {
        const validator = validators[name];

        if (typeof validator === "function") {
          const error = validator(value, values);
          if (error) {
            return error;
          }
        } else if (Array.isArray(validator)) {
          // Multiple validators for one field
          for (const validatorFn of validator) {
            const error = validatorFn(value, values);
            if (error) {
              return error;
            }
          }
        }

        return null;
      } catch (error) {
        ErrorHandler.log(error, {
          context: "validateField",
          field: name,
        });
        return "Validation error";
      }
    },
    [validators, values],
  );

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach((fieldName) => {
      const value = values[fieldName];
      const error = validateField(fieldName, value);

      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, validators, values]);

  // Handle field change
  const handleChange = useCallback(
    (name, value) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear submit error when user makes changes
      if (submitError) {
        setSubmitError(null);
      }

      // Validate on change if enabled
      if (validateOnChange && touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateOnChange, touched, validateField, submitError],
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate on blur if enabled
      if (validateOnBlur) {
        const value = values[name];
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateOnBlur, values, validateField],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (onSubmit) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(values).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);

        // Validate all fields
        const isValid = validateAll();

        if (!isValid) {
          showToast(
            getErrorMessage("VALIDATION_ERROR", "default") ||
              "Please fix the errors below",
            "error",
          );
          setIsSubmitting(false);
          return false;
        }

        // Call the submit handler
        const result = await onSubmit(values);

        // Clear draft on successful submission if enabled
        if (clearDraftOnSuccess) {
          await clearDraft();
        }

        setIsSubmitting(false);
        return result;
      } catch (error) {
        const normalizedError = ErrorHandler.normalize(error);

        ErrorHandler.log(normalizedError, {
          context: "form submission",
          formValues: values,
        });

        setSubmitError(normalizedError);
        setIsSubmitting(false);

        // Show user-friendly error message
        const userMessage = ErrorHandler.getUserMessage(normalizedError);

        if (normalizedError.code === "NETWORK_ERROR") {
          showToast("Saved locally. Will sync when online.", "info");
        } else {
          showToast(
            userMessage || "Submission failed. Please try again.",
            "error",
          );
        }

        return false;
      }
    },
    [values, validateAll, clearDraftOnSuccess, clearDraft],
  );

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setIsSubmitting(false);
  }, [initialValues]);

  // Set field value programmatically
  const setFieldValue = useCallback(
    (name, value) => {
      handleChange(name, value);
    },
    [handleChange],
  );

  // Set field error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  // Get field props for input components
  const getFieldProps = useCallback(
    (name) => ({
      value: values[name] || "",
      error: touched[name] ? errors[name] : null,
      onChangeText: platform.isWeb
        ? undefined
        : (value) => handleChange(name, value),
      onChange: platform.isWeb
        ? (e) => handleChange(name, e.target.value)
        : undefined,
      onBlur: () => handleBlur(name),
    }),
    [values, errors, touched, handleChange, handleBlur],
  );

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    submitError,

    // Draft management
    draft,
    isDraftAvailable,
    restoreDraft,
    discardDraft,
    saveDraft: () => saveDraft(values),

    // Field handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Utilities
    reset,
    setFieldValue,
    setFieldError,
    validateField,
    validateAll,
    getFieldProps,

    // Computed values
    isValid: Object.keys(errors).length < 1,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
  };
};

/**
 * Common validators for reuse
 */
export const commonValidators = {
  required:
    (message = "This field is required") =>
    (value) => {
      if (!value || (typeof value === "string" && !value.trim())) {
        return message;
      }
      return null;
    },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Must be less than ${max} characters`;
    }
    return null;
  },

  email:
    (message = "Invalid email address") =>
    (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return message;
      }
      return null;
    },

  phone:
    (message = "Invalid phone number") =>
    (value) => {
      if (value && !/^[\d\s\-+()]+$/.test(value)) {
        return message;
      }
      return null;
    },

  pattern:
    (regex, message = "Invalid format") =>
    (value) => {
      if (value && !regex.test(value)) {
        return message;
      }
      return null;
    },
};
