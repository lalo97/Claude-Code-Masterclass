import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { UserProvider, useUser } from "@/context/UserContext";

const mockUnsubscribe = vi.fn();
let capturedCallback: ((user: unknown) => void) | null = null;

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_, callback) => {
    capturedCallback = callback;
    return mockUnsubscribe;
  }),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

beforeEach(() => {
  vi.restoreAllMocks();
  capturedCallback = null;
  mockUnsubscribe.mockReset();
});

describe("UserContext", () => {
  it("has loading: true and user: null on initial render", () => {
    const { result } = renderHook(() => useUser(), { wrapper: UserProvider });
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it("has loading: false and user set after callback fires with a user", () => {
    const mockUser = {
      uid: "123",
      displayName: "Test User",
      email: "test@test.com",
    };
    const { result } = renderHook(() => useUser(), { wrapper: UserProvider });

    act(() => {
      capturedCallback!(mockUser);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it("has loading: false and user: null after callback fires with null", () => {
    const { result } = renderHook(() => useUser(), { wrapper: UserProvider });

    act(() => {
      capturedCallback!(null);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it("throws when useUser is called without a UserProvider", () => {
    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within a UserProvider",
    );
  });

  it("calls unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useUser(), { wrapper: UserProvider });
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });
});
