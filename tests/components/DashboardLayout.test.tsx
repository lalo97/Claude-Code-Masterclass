import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import HeistsLayout from "@/app/(dashboard)/layout";

vi.mock("@/context/UserContext", () => ({ useUser: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("@/components/Navbar", () => ({ default: () => <nav>Navbar</nav> }));

const mockReplace = vi.fn();

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as any);
  mockReplace.mockClear();
});

describe("DashboardLayout", () => {
  it("renders loader when loading is true", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true });
    render(<HeistsLayout>content</HeistsLayout>);

    expect(screen.queryByText("content")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("redirects to /login when user is null and loading is false", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false });
    render(<HeistsLayout>content</HeistsLayout>);

    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders children when user is present and loading is false", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123" } as any,
      loading: false,
    });
    render(<HeistsLayout>content</HeistsLayout>);

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
