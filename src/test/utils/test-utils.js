import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { SyncProvider } from "../../context/SyncContext";
import { ThemeProvider as ManyllaThemeProvider } from "../../context/ThemeContext";

// Create a basic theme for testing
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#F4E4C1",
    },
    background: {
      default: "#FFFFFF",
    },
  },
});

// Custom render function that includes providers
export const renderWithProviders = (
  ui,
  { initialTheme = "light", onProfileReceived = null, ...renderOptions } = {},
) => {
  function Wrapper({ children }) {
    return (
      <ThemeProvider theme={theme}>
        <ManyllaThemeProvider initialTheme={initialTheme}>
          <SyncProvider onProfileReceived={onProfileReceived}>
            {children}
          </SyncProvider>
        </ManyllaThemeProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from React Testing Library
export * from "@testing-library/react";

// Override render method
export { renderWithProviders as render };

// Custom utilities for testing
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const waitFor = (conditionFn, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = () => {
      try {
        const result = conditionFn();
        if (result) {
          resolve(result);
          return;
        }
      } catch (error) {
        // Continue checking
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("Condition timeout"));
        return;
      }

      setTimeout(checkCondition, 10);
    };

    checkCondition();
  });
};

// Mock user interactions
export const mockUser = {
  click: async (element) => {
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(element);
    await waitForAsync();
  },

  type: async (element, text) => {
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.change(element, { target: { value: text } });
    await waitForAsync();
  },

  submit: async (form) => {
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.submit(form);
    await waitForAsync();
  },
};

// Accessibility testing helpers
export const expectAccessibleName = (element, name) => {
  expect(element).toHaveAttribute("aria-label", name);
};

export const expectFocusable = (element) => {
  expect(element).not.toHaveAttribute("tabindex", "-1");
  expect(element.tabIndex).not.toBe(-1);
};

export const expectAriaExpanded = (element, expanded) => {
  expect(element).toHaveAttribute("aria-expanded", expanded.toString());
};

// Form testing helpers
export const expectFormValid = (form) => {
  expect(form.checkValidity()).toBe(true);
};

export const expectFormInvalid = (form) => {
  expect(form.checkValidity()).toBe(false);
};

export const getFormData = (form) => {
  const formData = new FormData(form);
  const data = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
};
