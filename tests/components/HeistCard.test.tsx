import { render, screen } from "@testing-library/react";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";
import { Heist } from "@/types/firestore";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/firebase", () => ({ db: {}, auth: {} }));

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ user: null }),
}));

function makeHeist(overrides?: Partial<Heist>): Heist {
  return {
    id: "heist-1",
    title: "Steal the Mona Lisa",
    description: "A classic art heist",
    createdBy: "uid-creator",
    createdByCodename: "WhisperKing",
    assignedTo: "uid-assignee",
    assignedToCodename: "SilentNinja",
    deadline: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5h from now
    finalStatus: null,
    status: "active",
    createdAt: new Date(),
    ...overrides,
  };
}

describe("HeistCard", () => {
  it("renders the title as a link to /heists/[id]", () => {
    render(<HeistCard heist={makeHeist()} />);
    const link = screen.getByRole("link", { name: /Steal the Mona Lisa/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/heists/heist-1");
  });

  it("renders @assignedToCodename and @createdByCodename", () => {
    render(<HeistCard heist={makeHeist()} />);
    expect(screen.getByText("@SilentNinja")).toBeDefined();
    expect(screen.getByText("@WhisperKing")).toBeDefined();
  });

  it("shows Overdue when deadline is in the past", () => {
    const heist = makeHeist({ deadline: new Date(Date.now() - 1000) });
    render(<HeistCard heist={heist} />);
    expect(screen.getByText("Overdue")).toBeDefined();
  });

  it("shows time remaining when deadline is in the future", () => {
    const heist = makeHeist({
      deadline: new Date(Date.now() + 5 * 60 * 60 * 1000),
    });
    render(<HeistCard heist={heist} />);
    const countdown = screen.getByText(/\d+h \d+m/);
    expect(countdown).toBeDefined();
  });

  it("does not throw when assignedToCodename is empty string", () => {
    const heist = makeHeist({ assignedToCodename: "" });
    expect(() => render(<HeistCard heist={heist} />)).not.toThrow();
  });
});

describe("HeistCardSkeleton", () => {
  it("renders without errors", () => {
    expect(() => render(<HeistCardSkeleton />)).not.toThrow();
  });
});
