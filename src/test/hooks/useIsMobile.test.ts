/**
 * Tests for useIsMobile hook
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile, useDeviceType, useBreakpoint } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for mobile viewport", () => {
    // Mock matchMedia to return true for mobile
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(max-width: 768px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false for desktop viewport", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});

describe("useDeviceType", () => {
  it("returns mobile for small viewport", () => {
    Object.defineProperty(window, "innerWidth", { value: 375, writable: true });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe("mobile");
  });

  it("returns tablet for medium viewport", () => {
    Object.defineProperty(window, "innerWidth", { value: 800, writable: true });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe("tablet");
  });

  it("returns desktop for large viewport", () => {
    Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe("desktop");
  });
});

describe("useBreakpoint", () => {
  it("returns correct breakpoint for mobile", () => {
    Object.defineProperty(window, "innerWidth", { value: 375, writable: true });

    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe("xs");
  });

  it("returns correct breakpoint for sm", () => {
    Object.defineProperty(window, "innerWidth", { value: 500, writable: true });

    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe("sm");
  });

  it("returns correct breakpoint for md", () => {
    Object.defineProperty(window, "innerWidth", { value: 800, writable: true });

    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe("md");
  });

  it("returns correct breakpoint for lg", () => {
    Object.defineProperty(window, "innerWidth", { value: 1100, writable: true });

    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe("lg");
  });

  it("returns correct breakpoint for xl", () => {
    Object.defineProperty(window, "innerWidth", { value: 1300, writable: true });

    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe("xl");
  });

  it("returns correct breakpoint for 2xl", () => {
    Object.defineProperty(window, "innerWidth", { value: 1600, writable: true });

    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe("2xl");
  });
});
