import { describe, it, expect, vi, afterEach } from "vitest";
import { generateCodename } from "@/lib/codename";

describe("generateCodename", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a non-empty string", () => {
    expect(typeof generateCodename()).toBe("string");
    expect(generateCodename().length).toBeGreaterThan(0);
  });

  it("contains no spaces or hyphens", () => {
    expect(generateCodename()).not.toMatch(/[\s-]/);
  });

  it("starts with an uppercase letter", () => {
    expect(generateCodename()[0]).toMatch(/[A-Z]/);
  });

  it("returns a predictable result when Math.random returns 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    // index 0 of each array: "Silent" + "Storm" + "Fox"
    expect(generateCodename()).toBe("SilentStormFox");
  });
});
