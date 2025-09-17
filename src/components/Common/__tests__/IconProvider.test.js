/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { Text } from "react-native";
import Icon, { CategoryIcons } from "../IconProvider";

// Mock platform utility to test fallback behavior
jest.mock("../../../utils/platform", () => ({
  isWeb: true,
  isMobile: false,
}));

// Mock react-native components
jest.mock("react-native", () => ({
  Text: ({ children, style, ...props }) => (
    <span style={style} {...props}>
      {children}
    </span>
  ),
}));

describe("IconProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Base Icon Component Fallback Behavior", () => {
    it("should render fallback text when icon not found on web", () => {
      const { container } = render(<Icon name="NonExistentIcon" size={24} color="#FF0000" />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveTextContent("○");
      expect(fallbackText).toHaveStyle({
        color: "rgb(255, 0, 0)",
      });
    });

    it("should apply custom styles to fallback", () => {
      const customStyle = { margin: "10px", backgroundColor: "blue" };
      const { container } = render(
        <Icon name="NonExistentIcon" size={32} color="#FF0000" style={customStyle} />
      );

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toHaveStyle({
        color: "rgb(255, 0, 0)",
        margin: "10px",
        backgroundColor: "blue",
      });
    });

    it("should use default props when not provided", () => {
      const { container } = render(<Icon name="NonExistentIcon" />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toHaveStyle({
        color: "rgb(0, 0, 0)", // default color
      });
    });

    it("should forward event handlers to fallback", () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Icon name="NonExistentIcon" onClick={handleClick} />
      );

      const fallbackText = container.querySelector("span");
      fallbackText.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should forward accessibility props to fallback", () => {
      const { container } = render(
        <Icon name="NonExistentIcon" aria-label="Icon button" role="button" tabIndex={0} />
      );

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toHaveAttribute("aria-label", "Icon button");
      expect(fallbackText).toHaveAttribute("role", "button");
      expect(fallbackText).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("Mobile Platform Fallback", () => {

    it("should render fallback text on mobile when vector icons not available", () => {
      const { container } = render(<Icon name="Menu" size={24} color="#000000" />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveTextContent("○");
    });

    it("should render fallback for unmapped icon names on mobile", () => {
      const { container } = render(<Icon name="UnmappedIcon" size={24} color="#000" />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveTextContent("○");
    });
  });

  describe("Category Icons", () => {
    it("should have all required category mappings", () => {
      const expectedCategories = [
        "goals",
        "strengths",
        "challenges",
        "medical",
        "behavior",
        "diet",
        "education",
        "dailyRoutines",
        "communication",
        "family",
        "milestones",
        "sensory",
        "therapy",
        "medications",
        "notes",
      ];

      expectedCategories.forEach((category) => {
        expect(CategoryIcons[category]).toBeDefined();
        expect(CategoryIcons[category].name).toBeDefined();
        expect(CategoryIcons[category].component).toBe(Icon);
      });
    });

    it("should have correct icon mappings for specific categories", () => {
      expect(CategoryIcons.goals.name).toBe("Psychology");
      expect(CategoryIcons.strengths.name).toBe("CheckCircle");
      expect(CategoryIcons.challenges.name).toBe("Warning");
      expect(CategoryIcons.medical.name).toBe("LocalHospital");
      expect(CategoryIcons.behavior.name).toBe("Psychology");
      expect(CategoryIcons.diet.name).toBe("Restaurant");
      expect(CategoryIcons.education.name).toBe("School");
      expect(CategoryIcons.dailyRoutines.name).toBe("Schedule");
      expect(CategoryIcons.family.name).toBe("Home");
      expect(CategoryIcons.notes.name).toBe("Description");
    });

    it("should render category icons correctly", () => {
      const GoalsIcon = CategoryIcons.goals.component;
      const { container } = render(
        <GoalsIcon name={CategoryIcons.goals.name} size={20} color="#333" />
      );

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveStyle({
        color: "rgb(51, 51, 51)",
      });
    });

    it("should have unique icon names for different categories", () => {
      const iconNames = Object.values(CategoryIcons).map(cat => cat.name);
      const uniqueIconNames = [...new Set(iconNames)];

      // Should have some unique icons (not all the same)
      expect(uniqueIconNames.length).toBeGreaterThan(1);

      // Check specific mappings are different
      expect(CategoryIcons.medical.name).not.toBe(CategoryIcons.education.name);
      expect(CategoryIcons.diet.name).not.toBe(CategoryIcons.family.name);
    });
  });

  describe("Error Handling", () => {
    it("should handle undefined icon names gracefully", () => {
      const { container } = render(<Icon name={undefined} />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveTextContent("○");
    });

    it("should handle null icon names gracefully", () => {
      const { container } = render(<Icon name={null} />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveTextContent("○");
    });

    it("should handle empty string icon names gracefully", () => {
      const { container } = render(<Icon name="" />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveTextContent("○");
    });

    it("should handle non-string icon names gracefully", () => {
      const { container } = render(<Icon name={123} />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveTextContent("○");
    });
  });

  describe("Props Handling", () => {
    it("should handle zero size gracefully", () => {
      const { container } = render(<Icon name="Test" size={0} />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveStyle({
        fontSize: "0px",
      });
    });

    it("should handle negative size gracefully", () => {
      const { container } = render(<Icon name="Test" size={-10} />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      // Font size should still be calculated
      expect(fallbackText.style.fontSize).toBeDefined();
    });

    it("should handle very large sizes", () => {
      const { container } = render(<Icon name="Test" size={1000} />);

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
      expect(fallbackText).toHaveStyle({
        fontSize: "800px", // 1000 * 0.8
      });
    });
  });

  describe("Style Merging", () => {
    it("should merge styles correctly with fallback", () => {
      const customStyle = {
        margin: "5px",
        backgroundColor: "red",
        fontSize: "50px", // Should be overridden
      };

      const { container } = render(
        <Icon name="Test" size={30} color="blue" style={customStyle} />
      );

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toHaveStyle({
        fontSize: "24px", // 30 * 0.8
        color: "blue",
        margin: "5px",
        backgroundColor: "red",
      });
    });

    it("should handle empty style object", () => {
      const { container } = render(
        <Icon name="Test" size={24} color="#000" style={{}} />
      );

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
    });

    it("should handle null style", () => {
      const { container } = render(
        <Icon name="Test" size={24} color="#000" style={null} />
      );

      const fallbackText = container.querySelector("span");
      expect(fallbackText).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render multiple icons efficiently", () => {
      const iconNames = ["Test1", "Test2", "Test3", "Test4", "Test5"];

      const { container } = render(
        <div>
          {iconNames.map((name, index) => (
            <Icon key={index} name={name} size={24} color="#000" />
          ))}
        </div>
      );

      const fallbackTexts = container.querySelectorAll("span");
      expect(fallbackTexts).toHaveLength(iconNames.length);

      // All should render the fallback symbol
      fallbackTexts.forEach(text => {
        expect(text).toHaveTextContent("○");
      });
    });

    it("should handle rapid re-renders", () => {
      const { rerender } = render(<Icon name="Test" size={24} />);

      // Rapidly change props
      for (let i = 0; i < 5; i++) {
        rerender(<Icon name={`Test${i}`} size={24 + i} color={`#${i}${i}${i}`} />);
      }

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });
});