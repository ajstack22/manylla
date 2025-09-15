/**
 * Real integration tests for DatePicker
 * Tests actual date picking behavior across platforms
 * Focus: Real behavior testing as required by Story S029
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DatePicker from "../DatePicker";

// Mock platform utilities
jest.mock("../../../utils/platform", () => ({
  isWeb: true,
  isMobile: false,
  isNative: false,
}));

describe("DatePicker Real Integration", () => {
  const defaultProps = {
    value: "2023-06-15",
    onChange: jest.fn(),
    label: "Select Date",
  };

  beforeEach(() => {
    defaultProps.onChange.mockClear();
  });

  describe("Basic Rendering and Interaction", () => {
    test("should render date picker on web platform", () => {
      render(<DatePicker {...defaultProps} />);

      expect(screen.getByDisplayValue("2023-06-15")).toBeInTheDocument();
    });

    test("should display current date value", () => {
      render(<DatePicker {...defaultProps} />);

      const input = screen.getByDisplayValue("2023-06-15");
      expect(input).toBeInTheDocument();
    });

    test("should handle date changes", () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      fireEvent.change(dateInput, { target: { value: "2023-12-25" } });

      expect(defaultProps.onChange).toHaveBeenCalledWith("2023-12-25");
    });

    test("should handle invalid date input gracefully", () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      fireEvent.change(dateInput, { target: { value: "invalid-date" } });

      // HTML5 date input normalizes invalid dates to empty string
      expect(defaultProps.onChange).toHaveBeenCalledWith("");
    });
  });

  describe("Props and Configuration", () => {
    test("should handle minimum date constraints", () => {
      render(<DatePicker {...defaultProps} min="2023-01-01" />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      expect(dateInput).toHaveAttribute("min", "2023-01-01");
    });

    test("should handle maximum date constraints", () => {
      render(<DatePicker {...defaultProps} max="2023-12-31" />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      expect(dateInput).toHaveAttribute("max", "2023-12-31");
    });

    test("should handle disabled state", () => {
      render(<DatePicker {...defaultProps} disabled={true} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      expect(dateInput).toBeDisabled();
    });

    test("should handle required state", () => {
      render(<DatePicker {...defaultProps} required={true} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      expect(dateInput).toBeRequired();
    });
  });

  describe("Date Formatting and Validation", () => {
    test("should format dates correctly for display", () => {
      render(<DatePicker {...defaultProps} value="2023-03-15" />);

      expect(screen.getByDisplayValue("2023-03-15")).toBeInTheDocument();
    });

    test("should handle edge dates correctly", () => {
      // Test leap year
      render(<DatePicker {...defaultProps} value="2024-02-29" />);

      expect(screen.getByDisplayValue("2024-02-29")).toBeInTheDocument();
    });

    test("should handle timezone considerations", () => {
      render(<DatePicker {...defaultProps} value="2023-06-15" />);

      // Should display the date correctly regardless of timezone
      const dateInput = screen.getByDisplayValue("2023-06-15");
      expect(dateInput.value).toMatch(/2023-06-15/);
    });
  });

  describe("Accessibility", () => {
    test("should render as date input type on web", () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      expect(dateInput).toHaveAttribute("type", "date");
    });

    test("should be keyboard accessible", () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).not.toBeDisabled();
    });

    test("should support additional props", () => {
      render(<DatePicker {...defaultProps} aria-label="Select birth date" />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      expect(dateInput).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    test("should handle null value gracefully", () => {
      render(<DatePicker {...defaultProps} value={null} />);

      const dateInput = screen.getByDisplayValue("");
      expect(dateInput.value).toBe("");
    });

    test("should handle undefined value gracefully", () => {
      render(<DatePicker {...defaultProps} value={undefined} />);

      const dateInput = screen.getByDisplayValue("");
      expect(dateInput.value).toBe("");
    });

    test("should handle missing onChange prop", () => {
      const { onChange, ...propsWithoutCallback } = defaultProps;

      expect(() => {
        render(<DatePicker {...propsWithoutCallback} />);
      }).not.toThrow();
    });
  });

  describe("Real-world Usage Scenarios", () => {
    test("should handle birth date selection", () => {
      const today = new Date().toISOString().split("T")[0];
      const birthDateProps = {
        ...defaultProps,
        max: today, // Cannot be in future
        min: "1900-01-01", // Reasonable minimum
      };

      render(<DatePicker {...birthDateProps} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      fireEvent.change(dateInput, { target: { value: "2015-03-20" } });

      expect(defaultProps.onChange).toHaveBeenCalledWith("2015-03-20");
    });

    test("should handle appointment date selection", () => {
      const today = new Date().toISOString().split("T")[0];
      const appointmentProps = {
        ...defaultProps,
        min: today, // Cannot be in past
      };

      render(<DatePicker {...appointmentProps} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");

      expect(dateInput).toHaveAttribute("min", today);
    });

    test("should handle form integration", () => {
      const FormWrapper = () => {
        const [selectedDate, setSelectedDate] = React.useState("2023-06-15");

        return (
          <form>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              required
            />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<FormWrapper />);

      const dateInput = screen.getByDisplayValue("2023-06-15");
      const submitButton = screen.getByRole("button", { name: /submit/i });

      expect(dateInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(dateInput).toBeRequired();
    });
  });

  describe("Performance", () => {
    test("should render quickly with valid date", () => {
      const startTime = Date.now();
      render(<DatePicker {...defaultProps} />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    test("should handle rapid date changes efficiently", () => {
      render(<DatePicker {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2023-06-15");

      // Rapid changes
      fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
      fireEvent.change(dateInput, { target: { value: "2023-02-01" } });
      fireEvent.change(dateInput, { target: { value: "2023-03-01" } });

      // Should have called onChange for each valid change
      expect(defaultProps.onChange).toHaveBeenCalledTimes(3);
    });
  });
});
