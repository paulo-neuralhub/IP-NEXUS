/**
 * Tests for useNetworkStatus hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNetworkStatus } from "@/hooks/use-mobile";

describe("useNetworkStatus", () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      writable: true,
    });
  });

  it("returns online when navigator.onLine is true", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it("returns offline when navigator.onLine is false", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);
  });

  it("updates status when online event fires", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", {
        value: true,
        writable: true,
      });
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("updates status when offline event fires", () => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", {
        value: false,
        writable: true,
      });
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
  });
});
