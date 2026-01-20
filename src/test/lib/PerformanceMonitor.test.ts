/**
 * Tests for PerformanceMonitor
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { PerformanceMonitor } from "@/lib/performance/PerformanceMonitor";

describe("PerformanceMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("record", () => {
    it("records a metric without error", () => {
      expect(() => {
        PerformanceMonitor.record("test_metric", 100, "ms", { tag: "value" });
      }).not.toThrow();
    });
  });

  describe("measure", () => {
    it("measures sync function duration and returns result", () => {
      const fn = vi.fn(() => "result");
      const result = PerformanceMonitor.measure("test", fn);
      expect(fn).toHaveBeenCalled();
      expect(result).toBe("result");
    });
  });

  describe("measureAsync", () => {
    it("measures async function duration", async () => {
      const fn = vi.fn(async () => "async result");
      const result = await PerformanceMonitor.measureAsync("async_op", fn);
      expect(fn).toHaveBeenCalled();
      expect(result).toBe("async result");
    });

    it("propagates errors", async () => {
      const fn = vi.fn(async () => { throw new Error("Test error"); });
      await expect(PerformanceMonitor.measureAsync("error_test", fn)).rejects.toThrow("Test error");
    });
  });

  describe("getWebVitals", () => {
    it("returns web vitals object", () => {
      const vitals = PerformanceMonitor.getWebVitals();
      expect(vitals).toBeDefined();
      expect(typeof vitals).toBe("object");
    });
  });
});
