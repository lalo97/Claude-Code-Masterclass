import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc } from "firebase/firestore";
import AuthForm from "@/components/AuthForm";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
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

const mockUser = { uid: "test-uid-123" };

async function fillAndSubmit() {
  const user = userEvent.setup();
  render(<AuthForm type="signup" />);
  await user.type(screen.getByLabelText("Email"), "new@example.com");
  await user.type(screen.getByLabelText("Password"), "secret123");
  await user.click(screen.getByRole("button", { name: /sign up/i }));
  return user;
}

describe("AuthForm signup — Firebase", () => {
  let mockPush: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as ReturnType<
      typeof useRouter
    >);
  });

  it("creates user, sets codename, writes Firestore doc, and redirects", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: mockUser,
    } as Awaited<ReturnType<typeof createUserWithEmailAndPassword>>);
    vi.mocked(updateProfile).mockResolvedValue(undefined);
    vi.mocked(setDoc).mockResolvedValue(undefined);

    await fillAndSubmit();

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "new@example.com",
        "secret123",
      );
      expect(updateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: "TestCodename",
      });
      expect(setDoc).toHaveBeenCalledWith("mock-doc-ref", {
        id: "test-uid-123",
        codename: "TestCodename",
      });
      expect(setDoc).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ email: expect.anything() }),
      );
      expect(mockPush).toHaveBeenCalledWith("/heists");
    });
  });

  it("shows error message for duplicate email", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
      code: "auth/email-already-in-use",
    });

    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "An account with this email already exists.",
      );
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows fallback error message for unexpected Firebase errors", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
      code: "auth/internal-error",
    });

    await fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Something went wrong. Please try again.",
      );
    });
  });

  it("disables the submit button while loading", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockImplementation(
      () => new Promise(() => {}),
    );

    await fillAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /signing up/i }),
      ).toBeDisabled();
    });
  });
});
