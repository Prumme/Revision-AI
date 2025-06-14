import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useToastStore } from "@/stores/toast";

describe("Toast Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  it("should initialize with empty toasts array", () => {
    const store = useToastStore();
    expect(store.toasts).toEqual([]);
  });

  it("should add a toast with correct properties", () => {
    const store = useToastStore();
    store.showToast("success", "Test message");

    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0]).toEqual({
      id: 1,
      type: "success",
      message: "Test message",
    });
  });

  it("should remove toast after 3 seconds", () => {
    const store = useToastStore();
    store.showToast("info", "Test message");

    expect(store.toasts).toHaveLength(1);

    vi.advanceTimersByTime(3000);

    expect(store.toasts).toHaveLength(0);
  });

  it("should remove toast manually by id", () => {
    const store = useToastStore();
    store.showToast("warning", "Test message 1");
    store.showToast("error", "Test message 2");

    expect(store.toasts).toHaveLength(2);

    store.removeToast(1);

    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0].id).toBe(2);
  });

  it("should increment toast id for each new toast", () => {
    const store = useToastStore();

    store.showToast("success", "First toast");
    store.showToast("info", "Second toast");
    store.showToast("warning", "Third toast");

    expect(store.toasts[0].id).toBe(1);
    expect(store.toasts[1].id).toBe(2);
    expect(store.toasts[2].id).toBe(3);
  });
});
