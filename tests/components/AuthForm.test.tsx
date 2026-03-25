import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AuthForm from "@/components/AuthForm";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  setDoc: vi.fn(),
  doc: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}));

vi.mock("@/lib/codename", () => ({
  generateCodename: vi.fn(),
}));

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AuthForm", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders login form with email, password fields and Login button", () => {
    render(<AuthForm type="login" />);
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Login" })).toBeDefined();
  });

  it("renders signup form with email, password fields and Sign Up button", () => {
    render(<AuthForm type="signup" />);
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
  });

  it("toggles password visibility on click", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput.getAttribute("type")).toBe("password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput.getAttribute("type")).toBe("text");

    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput.getAttribute("type")).toBe("password");
  });

  it("logs email and password on valid submit", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(consoleSpy).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "secret123",
    });
  });

  it("shows error when email is empty", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />);

    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert").textContent).toBe("Email is required.");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("shows error when email format is invalid", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert").textContent).toBe(
      "Please enter a valid email address.",
    );
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("shows error when password is shorter than 6 characters", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert").textContent).toBe(
      "Password must be at least 6 characters.",
    );
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("login links to /signup and signup links to /login", () => {
    const { unmount } = render(<AuthForm type="login" />);
    expect(
      screen.getByRole("link", { name: /don't have an account/i }),
    ).toHaveProperty("href", expect.stringContaining("/signup"));
    unmount();

    render(<AuthForm type="signup" />);
    expect(
      screen.getByRole("link", { name: /already have an account/i }),
    ).toHaveProperty("href", expect.stringContaining("/login"));
  });
});
