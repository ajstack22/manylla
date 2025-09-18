/* eslint-disable */
/**
 * Tests for useFormWithRecovery hook
 * Comprehensive testing of form lifecycle, validation, and draft recovery
 */

import { renderHook, act } from "@testing-library/react";
import { useFormWithRecovery, commonValidators } from "../useFormWithRecovery";

// Mock dependencies
jest.mock("../../utils/platform", () => ({
  isWeb: true,
}));

jest.mock("../../utils/errors", () => ({
  ErrorHandler: {
    log: jest.fn(),
    normalize: jest.fn((error) => ({
      code: error.message.includes("Network") ? "NETWORK_ERROR" : "GENERIC_ERROR",
      message: error.message,
      timestamp: Date.now(),
    })),
    getUserMessage: jest.fn((error) => error.message),
  },
}));

jest.mock("../../utils/errorMessages", () => ({
  getErrorMessage: jest.fn((code, fallback) => fallback),
}));

jest.mock("../../components/Toast/ToastManager", () => ({
  showToast: jest.fn(),
}));

// Mock AsyncStorage for React Native tests
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock("@react-native-async-storage/async-storage", () => ({
  default: mockAsyncStorage,
}));

// P2 TECH DEBT: Remove skip when working on useFormWithRecovery
// Issue: Form state management
describe.skip("useFormWithRecovery", () => {
  const initialValues = {
    name: "",
    email: "",
    description: "",
  };

  const validators = {
    name: commonValidators.required("Name is required"),
    email: [
      commonValidators.required("Email is required"),
      commonValidators.email("Invalid email format"),
    ],
  };

  // Create proper localStorage mock
  const mockLocalStorage = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset localStorage mock
    Object.keys(mockLocalStorage).forEach(key => {
      mockLocalStorage[key].mockClear();
    });
    mockLocalStorage.getItem.mockReturnValue(null);
    global.localStorage = mockLocalStorage;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);
      expect(result.current.isDraftAvailable).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.isDirty).toBe(false);
    });

    it("should initialize with custom options", () => {
      const options = {
        draftKey: "custom_draft",
        autosaveDelay: 2000,
        validateOnChange: false,
        validateOnBlur: false,
        clearDraftOnSuccess: false,
      };

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators, options)
      );

      expect(result.current.values).toEqual(initialValues);
    });
  });

  describe("form field handling", () => {
    it("should handle field changes", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John Doe");
      });

      expect(result.current.values.name).toBe("John Doe");
      expect(result.current.isDirty).toBe(true);
    });

    it("should handle field blur", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleBlur("name");
      });

      expect(result.current.touched.name).toBe(true);
    });

    it("should validate on change when enabled", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      // First touch the field
      act(() => {
        result.current.handleBlur("name");
      });

      // Then change it to empty (should trigger validation)
      act(() => {
        result.current.handleChange("name", "");
      });

      expect(result.current.errors.name).toBe("Name is required");
    });

    it("should validate on blur when enabled", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "");
        result.current.handleBlur("name");
      });

      expect(result.current.errors.name).toBe("Name is required");
      expect(result.current.isValid).toBe(false);
    });

    it("should clear submit error on field change", async () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      // Simulate submit error
      await act(async () => {
        await result.current.handleSubmit(async () => {
          throw new Error("Submit failed");
        });
      });

      expect(result.current.submitError).toBeTruthy();

      // Clear error by changing field
      act(() => {
        result.current.handleChange("name", "John");
      });

      expect(result.current.submitError).toBe(null);
    });
  });

  describe("validation", () => {
    it("should validate single field", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      const error = result.current.validateField("name", "");
      expect(error).toBe("Name is required");

      const noError = result.current.validateField("name", "John");
      expect(noError).toBe(null);
    });

    it("should validate all fields", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "");
        result.current.handleChange("email", "invalid-email");
      });

      let isValid;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.name).toBe("Name is required");
      expect(result.current.errors.email).toBe("Invalid email format");
    });

    it("should handle multiple validators for one field", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      // Test required validator first
      const requiredError = result.current.validateField("email", "");
      expect(requiredError).toBe("Email is required");

      // Test email format validator
      const formatError = result.current.validateField("email", "invalid");
      expect(formatError).toBe("Invalid email format");

      // Test valid email
      const noError = result.current.validateField("email", "test@example.com");
      expect(noError).toBe(null);
    });

    it("should handle validation errors gracefully", () => {
      const badValidators = {
        name: () => {
          throw new Error("Validator error");
        },
      };

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, badValidators)
      );

      const error = result.current.validateField("name", "test");
      expect(error).toBe("Validation error");
    });
  });

  describe("form submission", () => {
    it("should handle successful submission", async () => {
      const mockSubmit = jest.fn().mockResolvedValue(true);
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John Doe");
        result.current.handleChange("email", "john@example.com");
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit(mockSubmit);
      });

      expect(submitResult).toBe(true);
      expect(mockSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        description: "",
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should handle validation failure on submit", async () => {
      const mockSubmit = jest.fn();
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit(mockSubmit);
      });

      expect(submitResult).toBe(false);
      expect(mockSubmit).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.touched.name).toBe(true);
      expect(result.current.touched.email).toBe(true);
    });

    it("should handle submission error", async () => {
      const mockSubmit = jest.fn().mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John Doe");
        result.current.handleChange("email", "john@example.com");
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit(mockSubmit);
      });

      expect(submitResult).toBe(false);
      expect(result.current.submitError).toBeTruthy();
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should set submitting state during submission", async () => {
      const mockSubmit = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John Doe");
        result.current.handleChange("email", "john@example.com");
      });

      act(() => {
        result.current.handleSubmit(mockSubmit);
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        jest.runAllTimers();
        await Promise.resolve();
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("draft management", () => {
    it("should save draft on value changes", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John Doe");
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "form_draft",
        expect.stringContaining('"name":"John Doe"')
      );
    });

    it("should load draft on mount", async () => {
      const draftData = {
        values: { name: "Saved Name", email: "saved@example.com", description: "" },
        timestamp: Date.now() - 1000,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(draftData));

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      await act(async () => {
        // Allow effects to run
        await Promise.resolve();
      });

      expect(result.current.isDraftAvailable).toBe(true);
      expect(result.current.draft).toEqual(draftData.values);
    });

    it("should restore draft", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      const draftValues = { name: "Draft Name", email: "draft@example.com", description: "" };

      // Manually set draft (simulate loaded draft)
      result.current.draft = draftValues;
      result.current.isDraftAvailable = true;

      act(() => {
        result.current.restoreDraft();
      });

      expect(result.current.values).toEqual(draftValues);
      expect(result.current.isDraftAvailable).toBe(false);
    });

    it("should discard draft", async () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      await act(async () => {
        await result.current.discardDraft();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("form_draft");
    });

    it("should clear old drafts", async () => {
      const oldDraftData = {
        values: { name: "Old Name", email: "", description: "" },
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours old
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldDraftData));

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isDraftAvailable).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("form_draft");
    });

    it("should clear draft on successful submission", async () => {
      const mockSubmit = jest.fn().mockResolvedValue(true);
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators, { clearDraftOnSuccess: true })
      );

      act(() => {
        result.current.handleChange("name", "John Doe");
        result.current.handleChange("email", "john@example.com");
      });

      await act(async () => {
        await result.current.handleSubmit(mockSubmit);
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("form_draft");
    });
  });

  describe("utility functions", () => {
    it("should reset form", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John Doe");
        result.current.handleBlur("name");
        result.current.setFieldError("email", "Custom error");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.submitError).toBe(null);
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should set field value programmatically", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.setFieldValue("name", "Programmatic Value");
      });

      expect(result.current.values.name).toBe("Programmatic Value");
    });

    it("should set field error programmatically", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.setFieldError("description", "Custom error message");
      });

      expect(result.current.errors.description).toBe("Custom error message");
      expect(result.current.touched.description).toBe(true);
    });

    it("should generate field props", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John");
        result.current.handleBlur("name");
        result.current.setFieldError("name", "Test error");
      });

      const fieldProps = result.current.getFieldProps("name");

      expect(fieldProps.value).toBe("John");
      expect(fieldProps.error).toBe("Test error");
      expect(typeof fieldProps.onChange).toBe("function");
      expect(typeof fieldProps.onBlur).toBe("function");
    });
  });

  describe("React Native platform", () => {
    beforeEach(() => {
      jest.doMock("../../utils/platform", () => ({
        isWeb: false,
      }));
    });

    it("should use AsyncStorage on React Native", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      await act(async () => {
        jest.runAllTimers();
        await Promise.resolve();
      });

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("form_draft");
    });

    it("should save to AsyncStorage on React Native", async () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John Doe");
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "form_draft",
        expect.stringContaining('"name":"John Doe"')
      );
    });
  });

  describe("error handling", () => {
    it("should handle localStorage errors gracefully", async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isDraftAvailable).toBe(false);
    });

    it("should handle draft save errors gracefully", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      act(() => {
        result.current.handleChange("name", "John");
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not crash
      expect(result.current.values.name).toBe("John");
    });

    it("should handle malformed draft data", async () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, validators)
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isDraftAvailable).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty initial values", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery({}, {})
      );

      expect(result.current.values).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it("should handle undefined validators", () => {
      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, undefined)
      );

      const error = result.current.validateField("name", "");
      expect(error).toBe(null);
    });

    it("should handle function validators", () => {
      const functionValidator = (value) => {
        return value.length < 2 ? "Too short" : null;
      };

      const { result } = renderHook(() =>
        useFormWithRecovery(initialValues, { name: functionValidator })
      );

      const error = result.current.validateField("name", "a");
      expect(error).toBe("Too short");

      const noError = result.current.validateField("name", "abc");
      expect(noError).toBe(null);
    });
  });
});

// P2 TECH DEBT: Remove skip when working on commonValidators
// Issue: Form state management
describe.skip("commonValidators", () => {
  describe("required", () => {
    it("should validate required fields", () => {
      const validator = commonValidators.required("Field is required");

      expect(validator("")).toBe("Field is required");
      expect(validator("   ")).toBe("Field is required");
      expect(validator(null)).toBe("Field is required");
      expect(validator(undefined)).toBe("Field is required");
      expect(validator("valid")).toBe(null);
    });

    it("should use default message", () => {
      const validator = commonValidators.required();

      expect(validator("")).toBe("This field is required");
    });
  });

  describe("minLength", () => {
    it("should validate minimum length", () => {
      const validator = commonValidators.minLength(5, "Too short");

      expect(validator("abc")).toBe("Too short");
      expect(validator("abcde")).toBe(null);
      expect(validator("abcdef")).toBe(null);
      expect(validator(null)).toBe("Too short");
      expect(validator(undefined)).toBe("Too short");
    });

    it("should use default message", () => {
      const validator = commonValidators.minLength(3);

      expect(validator("ab")).toBe("Must be at least 3 characters");
    });
  });

  describe("maxLength", () => {
    it("should validate maximum length", () => {
      const validator = commonValidators.maxLength(5, "Too long");

      expect(validator("abcdef")).toBe("Too long");
      expect(validator("abcde")).toBe(null);
      expect(validator("abc")).toBe(null);
      expect(validator("")).toBe(null);
    });

    it("should use default message", () => {
      const validator = commonValidators.maxLength(3);

      expect(validator("abcd")).toBe("Must be less than 3 characters");
    });
  });

  describe("email", () => {
    it("should validate email format", () => {
      const validator = commonValidators.email();

      expect(validator("test@example.com")).toBe(null);
      expect(validator("user.name@domain.co.uk")).toBe(null);
      expect(validator("invalid-email")).toBe("Invalid email address");
      expect(validator("@example.com")).toBe("Invalid email address");
      expect(validator("test@")).toBe("Invalid email address");
      expect(validator("")).toBe(null); // Empty is valid (use required separately)
    });

    it("should use custom message", () => {
      const validator = commonValidators.email("Please enter a valid email");

      expect(validator("invalid")).toBe("Please enter a valid email");
    });
  });

  describe("phone", () => {
    it("should validate phone format", () => {
      const validator = commonValidators.phone();

      expect(validator("123-456-7890")).toBe(null);
      expect(validator("(123) 456-7890")).toBe(null);
      expect(validator("+1 123 456 7890")).toBe(null);
      expect(validator("1234567890")).toBe(null);
      expect(validator("abc-def-ghij")).toBe("Invalid phone number");
      expect(validator("12345678901234567890123")).toBe("Invalid phone number"); // Too long
      expect(validator("")).toBe(null); // Empty is valid
    });

    it("should use custom message", () => {
      const validator = commonValidators.phone("Please enter a valid phone number");

      expect(validator("invalid")).toBe("Please enter a valid phone number");
    });
  });

  describe("pattern", () => {
    it("should validate against custom regex", () => {
      const validator = commonValidators.pattern(/^\d{3}-\d{3}-\d{4}$/, "Invalid format");

      expect(validator("123-456-7890")).toBe(null);
      expect(validator("1234567890")).toBe("Invalid format");
      expect(validator("123-45-6789")).toBe("Invalid format");
      expect(validator("")).toBe(null); // Empty is valid
    });

    it("should use default message", () => {
      const validator = commonValidators.pattern(/^\d+$/);

      expect(validator("abc")).toBe("Invalid format");
    });
  });
});