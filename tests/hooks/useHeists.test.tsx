import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { useHeists } from "@/hooks/useHeists";

const mockUnsubscribe = vi.fn();
let capturedCallback: ((snapshot: unknown) => void) | null = null;

const mockUser = { uid: "user-123" };
let currentUser: typeof mockUser | null = mockUser;

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ user: currentUser }),
}));

const mockWithConverter = vi.fn().mockReturnThis();
const mockCollection = vi.fn(() => ({ withConverter: mockWithConverter }));
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOnSnapshot = vi.fn((_, callback) => {
  capturedCallback = callback;
  return mockUnsubscribe;
});
const mockTimestampNow = vi.fn(() => ({ seconds: 9999999 }));

vi.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  Timestamp: { now: () => mockTimestampNow() },
}));

function makeSnapshot(docs: { id: string; data: () => object }[]) {
  return { docs: docs.map((d) => ({ id: d.id, data: d.data })) };
}

beforeEach(() => {
  vi.clearAllMocks();
  capturedCallback = null;
  currentUser = mockUser;
  mockWithConverter.mockReturnThis();
  mockCollection.mockReturnValue({ withConverter: mockWithConverter });
  mockOnSnapshot.mockImplementation((_, callback) => {
    capturedCallback = callback;
    return mockUnsubscribe;
  });
});

describe("useHeists", () => {
  it("returns empty array and loading:false when user is null", () => {
    currentUser = null;
    const { result } = renderHook(() => useHeists("active"));
    expect(result.current.heists).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("returns empty array when snapshot has no docs", () => {
    const { result } = renderHook(() => useHeists("active"));
    act(() => {
      capturedCallback!(makeSnapshot([]));
    });
    expect(result.current.heists).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("returns shaped Heist[] for active mode", () => {
    const heist = {
      id: "h1",
      title: "Rob the bank",
      deadline: new Date(),
      createdBy: "other",
      assignedTo: "user-123",
      assignedToCodename: "Fox",
      createdByCodename: "Wolf",
      description: "desc",
      createdAt: new Date(),
      finalStatus: null,
      status: "active",
    };
    const { result } = renderHook(() => useHeists("active"));
    act(() => {
      capturedCallback!(makeSnapshot([{ id: "h1", data: () => heist }]));
    });
    expect(result.current.heists).toHaveLength(1);
    expect(result.current.heists[0]).toEqual(heist);
  });

  it("returns shaped Heist[] for assigned mode", () => {
    const heist = {
      id: "h2",
      title: "Crack the vault",
      deadline: new Date(),
      createdBy: "user-123",
      assignedTo: "other",
      assignedToCodename: "Fox",
      createdByCodename: "Wolf",
      description: "desc",
      createdAt: new Date(),
      finalStatus: null,
      status: "active",
    };
    const { result } = renderHook(() => useHeists("assigned"));
    act(() => {
      capturedCallback!(makeSnapshot([{ id: "h2", data: () => heist }]));
    });
    expect(result.current.heists).toHaveLength(1);
    expect(result.current.heists[0]).toEqual(heist);
  });

  it("returns shaped Heist[] for expired mode", () => {
    const heist = {
      id: "h3",
      title: "Old job",
      deadline: new Date(2020, 1, 1),
      createdBy: "a",
      assignedTo: "b",
      assignedToCodename: "Fox",
      createdByCodename: "Wolf",
      description: "desc",
      createdAt: new Date(),
      finalStatus: "success",
      status: "active",
    };
    const { result } = renderHook(() => useHeists("expired"));
    act(() => {
      capturedCallback!(makeSnapshot([{ id: "h3", data: () => heist }]));
    });
    expect(result.current.heists).toHaveLength(1);
    expect(result.current.heists[0]).toEqual(heist);
  });

  it("calls unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useHeists("active"));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });

  it("re-subscribes when mode changes", () => {
    const { rerender } = renderHook(
      ({ mode }: { mode: "active" | "assigned" | "expired" }) =>
        useHeists(mode),
      {
        initialProps: { mode: "active" },
      },
    );
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    rerender({ mode: "assigned" });
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
