import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChildCard } from "@/components/children/ChildCard";
import type { Child } from "@/lib/db/children";

// next/link renders an <a> in jsdom
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

function makeChild(overrides: Partial<Child> = {}): Child {
  return {
    id: "child-1",
    name: "Astrid",
    date_of_birth: "2025-03-23", // exactly 12 months before 2026-03-23
    sex: "female",
    parent_id: "parent-1",
    created_at: "2025-03-23T00:00:00Z",
    updated_at: "2025-03-23T00:00:00Z",
    ...overrides,
  };
}

describe("ChildCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-23"));
  });

  it("renders the child's name", () => {
    render(<ChildCard child={makeChild()} />);
    expect(screen.getByText("Astrid")).toBeInTheDocument();
  });

  it("renders an age label", () => {
    render(<ChildCard child={makeChild()} />);
    expect(screen.getByText("1 year")).toBeInTheDocument();
  });

  it("links to the child's profile page", () => {
    render(<ChildCard child={makeChild()} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/children/child-1");
  });

  it("shows 'Girl' badge for female child", () => {
    render(<ChildCard child={makeChild({ sex: "female" })} />);
    expect(screen.getByText("Girl")).toBeInTheDocument();
  });

  it("shows 'Boy' badge for male child", () => {
    render(<ChildCard child={makeChild({ sex: "male", name: "Oliver" })} />);
    expect(screen.getByText("Boy")).toBeInTheDocument();
  });

  it("has an accessible aria-label with name and age", () => {
    render(<ChildCard child={makeChild()} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-label")).toContain("Astrid");
    expect(link.getAttribute("aria-label")).toContain("1 year");
  });
});
