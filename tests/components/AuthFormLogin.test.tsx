import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signInWithEmailAndPassword } from "firebase/auth";
import AuthForm from "@/components/AuthForm";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  setDoc: vi.fn(),
  doc: vi.fn(() => "mock-doc-ref"),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}));

vi.mock("@/lib/codename", () => ({
  generateCodename: () => "TestCodename",
}));

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

async function fillAndSubmit() {
  const user = userEvent.setup();
  render(<AuthForm type="login" />);
  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Password"), "secret123");
  await user.click(screen.getByRole("button", { name: /login/i }));
  return user;
}

describe("AuthForm login — Firebase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls signInWithEmailAndPassword with correct args and shows success message", async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue(
      {} as Awaited<ReturnType<typeof signInWithEmailAndPassword>>,
    );

    await fillAndSubmit();

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "test@example.com",
        "secret123",
      );
      expect(screen.getByRole("status").textContent).toBe("Login successful.");
    });
  });

  it("clears email and password fields after successful login", async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue(
      {} as Awaited<ReturnType<typeof signInWithEmailAndPassword>>,
    );

    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByLabelText<HTMLInputElement>("Email").value).toBe("");
      expect(screen.getByLabelText<HTMLInputElement>("Password").value).toBe(
        "",
      );
    });
  });

  it("disables the submit button and shows loading label while in flight", async () => {
    vi.mocked(signInWithEmailAndPassword).mockImplementation(
      () => new Promise(() => {}),
    );

    await fillAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /logging in/i }),
      ).toBeDisabled();
    });
  });

  it("shows 'Invalid email or password.' for auth/wrong-password", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
      code: "auth/wrong-password",
    });

    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Invalid email or password.",
      );
    });
  });

  it("shows 'Invalid email or password.' for auth/invalid-credential", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
      code: "auth/invalid-credential",
    });

    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Invalid email or password.",
      );
    });
  });

  it("shows fallback error message for unexpected Firebase errors", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
      code: "auth/internal-error",
    });

    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Something went wrong. Please try again.",
      );
    });
  });

  it("smoke test: signup form renders without error", () => {
    render(<AuthForm type="signup" />);
    expect(screen.getByRole("button", { name: /sign up/i })).toBeDefined();
  });
});
