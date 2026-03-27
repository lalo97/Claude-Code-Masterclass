import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { addDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import CreateHeistForm from "@/components/CreateHeistForm";

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

const mockPush = vi.fn();

const mockUsers = {
  docs: [
    { id: "u1", data: () => ({ id: "u1", codename: "ShadowWolf" }) },
    { id: "u2", data: () => ({ id: "u2", codename: "IronFox" }) },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useUser).mockReturnValue({
    user: { uid: "user-123", displayName: "SilentFox" } as never,
    loading: false,
  });
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);
  vi.mocked(getDocs).mockResolvedValue(mockUsers as never);
});

async function fillValidForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Title"), "Bank Heist");
  await user.type(screen.getByLabelText("Description"), "Rob the vault.");
  await user.click(screen.getByLabelText("Assigned To"));
  await user.click(await screen.findByRole("option", { name: "ShadowWolf" }));
  await user.type(screen.getByLabelText("Deadline"), "2026-12-31");
}

describe("CreateHeistForm", () => {
  it("renders all form fields", () => {
    render(<CreateHeistForm />);
    expect(screen.getByLabelText("Title")).toBeDefined();
    expect(screen.getByLabelText("Description")).toBeDefined();
    expect(screen.getByLabelText("Assigned To")).toBeDefined();
    expect(screen.getByLabelText("Deadline")).toBeDefined();
  });

  it("shows user codenames in dropdown after getDocs resolves", async () => {
    render(<CreateHeistForm />);
    await userEvent.setup().click(screen.getByLabelText("Assigned To"));
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "ShadowWolf" })).toBeDefined();
      expect(screen.getByRole("option", { name: "IronFox" })).toBeDefined();
    });
  });

  it("calls addDoc with correct payload on Create Heist", async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: "new-heist" } as never);
    render(<CreateHeistForm />);
    await fillValidForm();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Create Heist" }));
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          title: "Bank Heist",
          description: "Rob the vault.",
          assignedTo: "u1",
          assignedToCodename: "ShadowWolf",
          createdBy: "user-123",
          createdByCodename: "SilentFox",
          finalStatus: null,
          status: "active",
        }),
      );
    });
  });

  it("redirects to /heists after successful submission", async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: "new-heist" } as never);
    render(<CreateHeistForm />);
    await fillValidForm();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Create Heist" }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists");
    });
  });

  it("disables submit button while submitting", async () => {
    vi.mocked(addDoc).mockReturnValue(new Promise(() => {}) as never);
    render(<CreateHeistForm />);
    await fillValidForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Create Heist" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Creating…" })).toHaveProperty(
        "disabled",
        true,
      );
    });
  });

  it("shows error message when addDoc rejects", async () => {
    vi.mocked(addDoc).mockRejectedValue(new Error("Firestore error"));
    render(<CreateHeistForm />);
    await fillValidForm();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Create Heist" }));
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Failed to create heist. Please try again.",
      );
    });
  });

  it("calls addDoc with status: draft when Save as Draft clicked", async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: "new-heist" } as never);
    render(<CreateHeistForm />);
    await fillValidForm();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Save as Draft" }));
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ status: "draft" }),
      );
    });
  });
});
