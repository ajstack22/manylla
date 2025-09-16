import { isValidElementId } from "../platform";

describe("Platform Security - ElementId Validation", () => {
  describe("Valid elementId patterns", () => {
    const validIds = [
      "element1",
      "my-element",
      "_private-element",
      "UPPERCASE-ID",
      "mixed-Case_123",
      "a", // Single character
      "a".repeat(100), // Max length
    ];

    test.each(validIds)("should accept valid elementId: %s", (elementId) => {
      expect(isValidElementId(elementId)).toBe(true);
    });
  });

  describe("Invalid elementId patterns", () => {
    const maliciousPatterns = [
      {
        id: "valid; } body { background: red !important; }",
        description: "CSS injection attempt",
      },
      {
        id: "test'><script>alert('xss')</script>",
        description: "XSS attempt via script tag",
      },
      {
        id: "element.with.dots",
        description: "CSS class selector injection",
      },
      {
        id: "element with spaces",
        description: "Invalid spaces",
      },
      {
        id: "element@symbol",
        description: "Invalid @ symbol",
      },
      {
        id: "element+plus",
        description: "Invalid + symbol",
      },
      {
        id: "element{bracket}",
        description: "Invalid curly brackets",
      },
      {
        id: "element[square]",
        description: "Invalid square brackets",
      },
      {
        id: "element(paren)",
        description: "Invalid parentheses",
      },
      {
        id: "element#hash",
        description: "Invalid hash symbol",
      },
      {
        id: "element%percent",
        description: "Invalid percent symbol",
      },
      {
        id: "a".repeat(101),
        description: "Too long (over 100 chars)",
      },
    ];

    test.each(maliciousPatterns)(
      "should reject $description: $id",
      ({ id }) => {
        expect(isValidElementId(id)).toBe(false);
      },
    );
  });

  describe("Invalid types", () => {
    const invalidTypes = [
      { value: null, description: "null" },
      { value: undefined, description: "undefined" },
      { value: 123, description: "number" },
      { value: {}, description: "object" },
      { value: [], description: "array" },
      { value: true, description: "boolean" },
      { value: "", description: "empty string" },
    ];

    test.each(invalidTypes)("should reject $description", ({ value }) => {
      expect(isValidElementId(value)).toBe(false);
    });
  });

  describe("CSS injection prevention", () => {
    it("should prevent CSS rule injection", () => {
      const cssInjection = "test; } * { background: red !important; } .fake {";
      expect(isValidElementId(cssInjection)).toBe(false);
    });

    it("should prevent media query injection", () => {
      const mediaInjection =
        "test; } @media screen { body { display: none; } } .fake {";
      expect(isValidElementId(mediaInjection)).toBe(false);
    });

    it("should prevent comment injection", () => {
      const commentInjection = "test/*malicious*/";
      expect(isValidElementId(commentInjection)).toBe(false);
    });

    it("should prevent string injection with quotes", () => {
      const quoteInjection = "test\"'; alert('xss'); '\"";
      expect(isValidElementId(quoteInjection)).toBe(false);
    });

    it("should prevent attribute injection", () => {
      const attrInjection = "test onclick=alert(1)";
      expect(isValidElementId(attrInjection)).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should reject elements starting with numbers", () => {
      expect(isValidElementId("123element")).toBe(false);
    });

    it("should reject elements starting with special chars except _ and -", () => {
      expect(isValidElementId(".element")).toBe(false);
      expect(isValidElementId("@element")).toBe(false);
      expect(isValidElementId("#element")).toBe(false);
    });

    it("should accept elements starting with underscore or hyphen", () => {
      expect(isValidElementId("_element")).toBe(true);
      expect(isValidElementId("-element")).toBe(true);
    });

    it("should handle maximum length boundary", () => {
      expect(isValidElementId("a".repeat(100))).toBe(true);
      expect(isValidElementId("a".repeat(101))).toBe(false);
    });
  });
});
