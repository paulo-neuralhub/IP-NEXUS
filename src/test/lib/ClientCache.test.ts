/**
 * Tests for ClientCache
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClientCache, CacheKeys } from "@/lib/performance/ClientCache";

describe("ClientCache", () => {
  beforeEach(() => {
    ClientCache.clear();
    vi.clearAllMocks();
  });

  describe("Basic operations", () => {
    it("sets and gets values correctly", () => {
      ClientCache.set("test-key", { foo: "bar" });
      const result = ClientCache.get("test-key");
      expect(result).toEqual({ foo: "bar" });
    });

    it("returns undefined for non-existent keys", () => {
      const result = ClientCache.get("non-existent");
      expect(result).toBeUndefined();
    });

    it("deletes values correctly", () => {
      ClientCache.set("test-key", "value");
      expect(ClientCache.get("test-key")).toBe("value");
      ClientCache.delete("test-key");
      expect(ClientCache.get("test-key")).toBeUndefined();
    });

    it("clears all values", () => {
      ClientCache.set("key1", "value1");
      ClientCache.set("key2", "value2");
      ClientCache.clear();
      expect(ClientCache.get("key1")).toBeUndefined();
      expect(ClientCache.get("key2")).toBeUndefined();
    });
  });

  describe("getOrSet", () => {
    it("returns cached value if exists", async () => {
      ClientCache.set("test-key", "cached-value");
      const factory = vi.fn().mockResolvedValue("new-value");
      const result = await ClientCache.getOrSet("test-key", factory);
      expect(result).toBe("cached-value");
      expect(factory).not.toHaveBeenCalled();
    });

    it("calls factory and caches result if not exists", async () => {
      const factory = vi.fn().mockResolvedValue("new-value");
      const result = await ClientCache.getOrSet("test-key", factory);
      expect(result).toBe("new-value");
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });
});

describe("CacheKeys", () => {
  it("generates user key correctly", () => {
    expect(CacheKeys.user("user-123")).toBe("user:user-123");
  });

  it("generates org key correctly", () => {
    expect(CacheKeys.org("org-456")).toBe("org:org-456");
  });

  it("generates matter key correctly", () => {
    expect(CacheKeys.matter("matter-789")).toBe("matter:matter-789");
  });
});
