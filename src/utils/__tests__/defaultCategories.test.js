/* eslint-disable */
/**
 * Default Categories Tests
 */
import { defaultCategories } from "../defaultCategories";

describe("defaultCategories", () => {
  test("should be an array", () => {
    expect(Array.isArray(defaultCategories)).toBe(true);
  });

  test("should contain at least one category", () => {
    expect(defaultCategories.length).toBeGreaterThan(0);
  });

  test("should have valid category structure", () => {
    defaultCategories.forEach((category) => {
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("displayName");
      expect(category).toHaveProperty("color");
      expect(category).toHaveProperty("order");
      expect(category).toHaveProperty("isCustom");

      // Validate types
      expect(typeof category.id).toBe("string");
      expect(typeof category.name).toBe("string");
      expect(typeof category.displayName).toBe("string");
      expect(typeof category.color).toBe("string");
      expect(typeof category.order).toBe("number");
      expect(typeof category.isCustom).toBe("boolean");

      // Validate color format (should be hex color)
      expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);

      // Validate non-empty strings
      expect(category.id.trim()).not.toBe("");
      expect(category.name.trim()).not.toBe("");
      expect(category.displayName.trim()).not.toBe("");
    });
  });

  test("should have unique IDs", () => {
    const ids = defaultCategories.map((category) => category.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  test("should have unique names", () => {
    const names = defaultCategories.map((category) => category.name);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });

  test("should contain core categories", () => {
    const categoryIds = defaultCategories.map((cat) => cat.id);

    expect(categoryIds).toContain("medical-history");
    expect(categoryIds).toContain("development-history");
    expect(categoryIds).toContain("goals");
  });

  test("should have all categories marked as non-custom", () => {
    defaultCategories.forEach((category) => {
      expect(category.isCustom).toBe(false);
    });
  });

  test("should have proper ordering values", () => {
    defaultCategories.forEach((category) => {
      expect(category.order).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(category.order)).toBe(true);
    });
  });

  test("should have required properties for each category", () => {
    const requiredProps = [
      "id",
      "name",
      "displayName",
      "color",
      "order",
      "isCustom",
    ];

    defaultCategories.forEach((category) => {
      requiredProps.forEach((prop) => {
        expect(category).toHaveProperty(prop);
        expect(category[prop]).toBeDefined();
      });
    });
  });

  test("should validate hex color format strictly", () => {
    defaultCategories.forEach((category) => {
      // More strict hex validation
      expect(category.color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
      expect(category.color.length).toBeGreaterThanOrEqual(4);
      expect(category.color.length).toBeLessThanOrEqual(7);
    });
  });

  test("should have meaningful display names", () => {
    defaultCategories.forEach((category) => {
      expect(category.displayName).not.toBe(category.id);
      expect(category.displayName.length).toBeGreaterThan(0);
      expect(category.displayName.trim()).toBe(category.displayName);
    });
  });

  test("should support category lookup by id", () => {
    expect(defaultCategories.length).toBeGreaterThan(0);
    const firstCategory = defaultCategories[0];
    const found = defaultCategories.find((cat) => cat.id === firstCategory.id);
    expect(found).toBe(firstCategory);
  });

  test("should support category filtering by custom status", () => {
    const nonCustomCategories = defaultCategories.filter(
      (cat) => !cat.isCustom,
    );
    expect(nonCustomCategories.length).toBe(defaultCategories.length);
  });

  test("should have consistent property types across all categories", () => {
    expect(defaultCategories.length).toBeGreaterThanOrEqual(2);
    const firstCat = defaultCategories[0];
    const secondCat = defaultCategories[1];

    expect(typeof firstCat.id).toBe(typeof secondCat.id);
    expect(typeof firstCat.name).toBe(typeof secondCat.name);
    expect(typeof firstCat.displayName).toBe(typeof secondCat.displayName);
    expect(typeof firstCat.color).toBe(typeof secondCat.color);
    expect(typeof firstCat.order).toBe(typeof secondCat.order);
    expect(typeof firstCat.isCustom).toBe(typeof secondCat.isCustom);
  });
});
