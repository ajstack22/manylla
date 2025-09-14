import { manyllaColors, lightTheme, darkTheme, manyllaTheme } from "../theme";

describe("theme", () => {
  describe("manyllaColors", () => {
    test("should have required color properties", () => {
      expect(manyllaColors).toHaveProperty("manila");
      expect(manyllaColors).toHaveProperty("brown");
      expect(manyllaColors).toHaveProperty("darkBrown");
      expect(manyllaColors).toHaveProperty("accent");
      expect(manyllaColors).toHaveProperty("success");
      expect(manyllaColors).toHaveProperty("warning");
      expect(manyllaColors).toHaveProperty("error");
    });

    test("should have valid hex color formats", () => {
      const hexColorRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

      expect(manyllaColors.manila).toMatch(hexColorRegex);
      expect(manyllaColors.brown).toMatch(hexColorRegex);
      expect(manyllaColors.darkBrown).toMatch(hexColorRegex);
      expect(manyllaColors.accent).toMatch(hexColorRegex);
      expect(manyllaColors.success).toMatch(hexColorRegex);
      expect(manyllaColors.warning).toMatch(hexColorRegex);
      expect(manyllaColors.error).toMatch(hexColorRegex);
    });

    test("should have manila envelope theme colors", () => {
      expect(manyllaColors.manila).toBe("#F4E4C1");
      expect(manyllaColors.manilaLight).toBe("#FAF3E3");
      expect(manyllaColors.manilaDark).toBe("#E8D4A2");
    });

    test("should have light mode manila colors", () => {
      expect(manyllaColors).toHaveProperty("lightManilaBackground");
      expect(manyllaColors).toHaveProperty("lightManilaPaper");
      expect(manyllaColors).toHaveProperty("lightManilaAccent");
    });

    test("should have dark mode colors", () => {
      expect(manyllaColors).toHaveProperty("darkBackground");
      expect(manyllaColors).toHaveProperty("darkPaper");
      expect(manyllaColors).toHaveProperty("darkAccent");
      expect(manyllaColors).toHaveProperty("darkText");
      expect(manyllaColors).toHaveProperty("darkTextSecondary");
    });

    test("should have manylla theme specific colors", () => {
      expect(manyllaColors).toHaveProperty("manyllaBackground");
      expect(manyllaColors).toHaveProperty("manyllaPaper");
      expect(manyllaColors).toHaveProperty("manyllaAccent");
      expect(manyllaColors).toHaveProperty("manyllaText");
      expect(manyllaColors).toHaveProperty("manyllaTextSecondary");
      expect(manyllaColors).toHaveProperty("manyllaBorder");
    });

    test("should have component-specific colors", () => {
      expect(manyllaColors).toHaveProperty("avatarDefaultBg");
      expect(manyllaColors).toHaveProperty("inputBackground");
    });
  });

  describe("lightTheme", () => {
    test("should have required theme structure", () => {
      expect(lightTheme).toHaveProperty("colors");
      expect(lightTheme).toHaveProperty("typography");
      expect(lightTheme).toHaveProperty("shape");
      expect(lightTheme).toHaveProperty("components");
    });

    test("should have required color properties", () => {
      expect(lightTheme.colors).toHaveProperty("primary");
      expect(lightTheme.colors).toHaveProperty("secondary");
      expect(lightTheme.colors).toHaveProperty("background");
      expect(lightTheme.colors).toHaveProperty("surface");
      expect(lightTheme.colors).toHaveProperty("text");
      expect(lightTheme.colors).toHaveProperty("textSecondary");
      expect(lightTheme.colors).toHaveProperty("border");
    });

    test("should use manila colors appropriately", () => {
      expect(lightTheme.colors.primary).toBe(manyllaColors.brown);
      expect(lightTheme.colors.primaryLight).toBe(manyllaColors.manila);
      expect(lightTheme.colors.primaryDark).toBe(manyllaColors.darkBrown);
      expect(lightTheme.colors.background).toBe(
        manyllaColors.lightManilaBackground,
      );
      expect(lightTheme.colors.surface).toBe(manyllaColors.lightManilaPaper);
    });

    test("should have typography configuration", () => {
      expect(lightTheme.typography).toHaveProperty("fontFamily");
      expect(lightTheme.typography).toHaveProperty("h1");
      expect(lightTheme.typography).toHaveProperty("h2");
      expect(lightTheme.typography).toHaveProperty("body1");
      expect(lightTheme.typography).toHaveProperty("body2");
      expect(lightTheme.typography).toHaveProperty("caption");
    });

    test("should have shape configuration", () => {
      expect(lightTheme.shape).toHaveProperty("borderRadius");
      expect(typeof lightTheme.shape.borderRadius).toBe("number");
    });

    test("should have component configurations", () => {
      expect(lightTheme.components).toHaveProperty("button");
      expect(lightTheme.components).toHaveProperty("card");
      expect(lightTheme.components.button).toHaveProperty("borderRadius");
      expect(lightTheme.components.card).toHaveProperty("shadowColor");
    });

    test("should have proper typography sizes", () => {
      expect(lightTheme.typography.h1.fontSize).toBe(40);
      expect(lightTheme.typography.h2.fontSize).toBe(32);
      expect(lightTheme.typography.body1.fontSize).toBe(16);
      expect(lightTheme.typography.body2.fontSize).toBe(14);
      expect(lightTheme.typography.caption.fontSize).toBe(12);
    });

    test("should use Atkinson Hyperlegible font", () => {
      expect(lightTheme.typography.fontFamily).toContain(
        "Atkinson Hyperlegible",
      );
    });
  });

  describe("darkTheme", () => {
    test("should have required theme structure", () => {
      expect(darkTheme).toHaveProperty("colors");
      expect(darkTheme).toHaveProperty("typography");
      expect(darkTheme).toHaveProperty("shape");
      expect(darkTheme).toHaveProperty("components");
    });

    test("should have dark color scheme", () => {
      expect(darkTheme.colors.background).toBe(manyllaColors.darkBackground);
      expect(darkTheme.colors.surface).toBe(manyllaColors.darkPaper);
      expect(darkTheme.colors.text).toBe(manyllaColors.darkText);
      expect(darkTheme.colors.textSecondary).toBe(
        manyllaColors.darkTextSecondary,
      );
    });

    test("should share typography with light theme", () => {
      expect(darkTheme.typography).toBe(lightTheme.typography);
    });

    test("should share shape with light theme", () => {
      expect(darkTheme.shape).toBe(lightTheme.shape);
    });

    test("should have enhanced shadow for dark mode", () => {
      expect(darkTheme.components.card.shadowOpacity).toBeGreaterThan(
        lightTheme.components.card.shadowOpacity,
      );
      expect(darkTheme.components.card.elevation).toBeGreaterThan(
        lightTheme.components.card.elevation,
      );
    });

    test("should have proper contrast colors for dark mode", () => {
      // Dark mode should have brighter accent colors for visibility
      expect(darkTheme.colors.secondary).toBe("#6BA3E5");
      expect(darkTheme.colors.success).toBe("#7BC47F");
      expect(darkTheme.colors.warning).toBe("#F5B478");
      expect(darkTheme.colors.error).toBe("#EA8368");
    });
  });

  describe("manyllaTheme", () => {
    test("should have required theme structure", () => {
      expect(manyllaTheme).toHaveProperty("colors");
      expect(manyllaTheme).toHaveProperty("typography");
      expect(manyllaTheme).toHaveProperty("shape");
      expect(manyllaTheme).toHaveProperty("components");
    });

    test("should use manylla color scheme", () => {
      expect(manyllaTheme.colors.background).toBe(
        manyllaColors.manyllaBackground,
      );
      expect(manyllaTheme.colors.surface).toBe(manyllaColors.manyllaPaper);
      expect(manyllaTheme.colors.text).toBe(manyllaColors.manyllaText);
      expect(manyllaTheme.colors.textSecondary).toBe(
        manyllaColors.manyllaTextSecondary,
      );
    });

    test("should have manylla-specific accent colors", () => {
      expect(manyllaTheme.colors.success).toBe("#4A7A51"); // Forest green
      expect(manyllaTheme.colors.warning).toBe("#B87333"); // Copper
      expect(manyllaTheme.colors.error).toBe("#8B3A3A"); // Burgundy
      expect(manyllaTheme.colors.secondary).toBe("#4A7C8E"); // Muted teal
    });

    test("should share base configuration with light theme", () => {
      expect(manyllaTheme.typography).toBe(lightTheme.typography);
      expect(manyllaTheme.shape).toBe(lightTheme.shape);
    });

    test("should have manila-specific shadow styling", () => {
      expect(manyllaTheme.components.card.shadowColor).toBe(
        "rgba(61, 47, 31, 0.15)",
      );
      expect(manyllaTheme.components.card.shadowOpacity).toBe(1);
    });

    test("should use dark brown as primary", () => {
      expect(manyllaTheme.colors.primary).toBe(manyllaColors.darkBrown);
      expect(manyllaTheme.colors.primaryLight).toBe(manyllaColors.brown);
    });
  });

  describe("theme consistency", () => {
    test("all themes should have the same typography structure", () => {
      const expectedTypographyKeys = [
        "fontFamily",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "body1",
        "body2",
        "caption",
      ];

      expectedTypographyKeys.forEach((key) => {
        expect(lightTheme.typography).toHaveProperty(key);
        expect(darkTheme.typography).toHaveProperty(key);
        expect(manyllaTheme.typography).toHaveProperty(key);
      });
    });

    test("all themes should have the same shape configuration", () => {
      expect(darkTheme.shape.borderRadius).toBe(lightTheme.shape.borderRadius);
      expect(manyllaTheme.shape.borderRadius).toBe(
        lightTheme.shape.borderRadius,
      );
    });

    test("all themes should have required color properties", () => {
      const requiredColorKeys = [
        "primary",
        "primaryLight",
        "primaryDark",
        "secondary",
        "background",
        "surface",
        "text",
        "textSecondary",
        "textDisabled",
        "border",
        "success",
        "warning",
        "error",
      ];

      const themes = [lightTheme, darkTheme, manyllaTheme];

      themes.forEach((theme) => {
        requiredColorKeys.forEach((colorKey) => {
          expect(theme.colors).toHaveProperty(colorKey);
          expect(typeof theme.colors[colorKey]).toBe("string");
        });
      });
    });

    test("all themes should have component configurations", () => {
      const themes = [lightTheme, darkTheme, manyllaTheme];

      themes.forEach((theme) => {
        expect(theme.components).toHaveProperty("button");
        expect(theme.components).toHaveProperty("card");
        expect(theme.components.button).toHaveProperty("borderRadius");
        expect(theme.components.card).toHaveProperty("borderRadius");
        expect(theme.components.card).toHaveProperty("shadowColor");
      });
    });

    test("color values should be valid", () => {
      const themes = [lightTheme, darkTheme, manyllaTheme];
      const hexOrRgbaRegex = /^(#([0-9A-F]{3}|[0-9A-F]{6})|rgba?\([^)]+\))$/i;

      themes.forEach((theme) => {
        Object.values(theme.colors).forEach((color) => {
          expect(color).toMatch(hexOrRgbaRegex);
        });
      });
    });

    test("typography sizes should be reasonable", () => {
      const themes = [lightTheme, darkTheme, manyllaTheme];

      themes.forEach((theme) => {
        expect(theme.typography.h1.fontSize).toBeGreaterThan(
          theme.typography.h2.fontSize,
        );
        expect(theme.typography.h2.fontSize).toBeGreaterThan(
          theme.typography.body1.fontSize,
        );
        expect(theme.typography.body1.fontSize).toBeGreaterThan(
          theme.typography.caption.fontSize,
        );

        // Reasonable size bounds
        expect(theme.typography.h1.fontSize).toBeLessThanOrEqual(60);
        expect(theme.typography.caption.fontSize).toBeGreaterThanOrEqual(10);
      });
    });
  });
});
