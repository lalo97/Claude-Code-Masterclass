import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUser } from "@/context/UserContext";
import { signOut } from "firebase/auth";
import Navbar from "@/components/Navbar";

vi.mock("@/context/UserContext", () => ({ useUser: vi.fn() }));
vi.mock("firebase/auth", () => ({ signOut: vi.fn() }));
vi.mock("@/lib/firebase", () => ({ auth: {} }));

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({ user: null, loading: false });
});

describe("Navbar", () => {
  it("renders the main heading", () => {
    render(<Navbar />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("renders the Create Heist link", () => {
    render(<Navbar />);

    const createLink = screen.getByRole("link", { name: /create new heist/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/heists/create");
  });

  it("renders the logout button when user is logged in", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123" } as any,
      loading: false,
    });
    render(<Navbar />);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("does not render the logout button when user is null", () => {
    render(<Navbar />);

    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("calls signOut when the logout button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123" } as any,
      loading: false,
    });
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(signOut).toHaveBeenCalled();
  });
});
