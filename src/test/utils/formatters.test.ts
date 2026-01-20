/**
 * Tests for utility functions
 */

import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("merges class names correctly", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const result = cn("base", true && "included", false && "excluded");
    expect(result).toBe("base included");
  });

  it("handles undefined and null values", () => {
    const result = cn("base", undefined, null, "end");
    expect(result).toBe("base end");
  });

  it("handles empty strings", () => {
    const result = cn("base", "", "end");
    expect(result).toBe("base end");
  });

  it("handles arrays of classes", () => {
    const result = cn(["foo", "bar"]);
    expect(result).toBe("foo bar");
  });

  it("handles objects with boolean values", () => {
    const result = cn({
      base: true,
      included: true,
      excluded: false,
    });
    expect(result).toBe("base included");
  });

  it("merges Tailwind classes correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("handles conflicting Tailwind classes", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("preserves non-conflicting Tailwind classes", () => {
    const result = cn("text-red-500 font-bold", "bg-blue-500");
    expect(result).toBe("text-red-500 font-bold bg-blue-500");
  });
});

describe("Date formatting", () => {
  it("formats date correctly", () => {
    const date = new Date("2024-06-15T00:00:00Z");
    const formatted = date.toLocaleDateString("es-ES");
    expect(formatted).toMatch(/15/);
    expect(formatted).toMatch(/6|06/);
    expect(formatted).toMatch(/2024/);
  });

  it("handles invalid dates", () => {
    const date = new Date("invalid");
    expect(isNaN(date.getTime())).toBe(true);
  });
});

describe("Number formatting", () => {
  it("formats currency correctly", () => {
    const formatter = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    });
    const result = formatter.format(1234.56);
    expect(result).toMatch(/1\.234,56/);
    expect(result).toMatch(/€/);
  });

  it("formats percentages correctly", () => {
    const formatter = new Intl.NumberFormat("es-ES", {
      style: "percent",
      minimumFractionDigits: 1,
    });
    const result = formatter.format(0.1234);
    expect(result).toMatch(/12,3/);
    expect(result).toMatch(/%/);
  });
});
