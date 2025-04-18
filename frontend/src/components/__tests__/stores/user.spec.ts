import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUserStore } from "@/stores/user";
import type { User } from "@/types/user";

describe("User Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with null user", () => {
    const store = useUserStore();
    expect(store.user).toBeNull();
  });

  it("should set the user correctly", () => {
    const store = useUserStore();
    const mockUser: User = {
      id: "id-1",
      firstname: "John",
      lastname: "Smith",
      email: "alice@example.com",
    };

    store.setUser(mockUser);
    expect(store.user).toEqual(mockUser);
  });

  it("should clear the user", () => {
    const store = useUserStore();
    const mockUser: User = {
      id: "id-2",
      firstname: "Bob",
      lastname: "Brown",
      email: "bob@example.com",
    };

    store.setUser(mockUser);
    store.clearUser();
    expect(store.user).toBeNull();
  });
});
