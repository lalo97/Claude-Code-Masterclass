import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders successfully", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByRole("img", { name: /alice/i })).toBeDefined()
  })

  it("displays the first letter for a regular name", () => {
    render(<Avatar name="mario" />)
    expect(screen.getByText("M")).toBeDefined()
  })

  it("displays the first two uppercase letters for a PascalCase name", () => {
    render(<Avatar name="PocketHeist" />)
    expect(screen.getByText("PH")).toBeDefined()
  })

  it("falls back to single letter when only one uppercase letter exists", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeDefined()
  })
})
