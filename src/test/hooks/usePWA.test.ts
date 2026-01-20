/**
 * Tests for usePWA hook
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePWA } from "@/hooks/use-pwa";

describe("usePWA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({ update: vi.fn() }),
        register: vi.fn(),
        addEventListener: vi.fn(),
      },
      writable: true,
    });
  });

  it("starts with correct initial state", () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isOnline).toBe(true);
  });

  it("provides install function", () => {
    const { result } = renderHook(() => usePWA());
    expect(typeof result.current.install).toBe("function");
  });

  it("provides update function", () => {
    const { result } = renderHook(() => usePWA());
    expect(typeof result.current.update).toBe("function");
  });
});
