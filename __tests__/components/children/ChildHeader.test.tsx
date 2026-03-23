import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChildHeader } from "@/components/children/ChildHeader";
import type { Child } from "@/lib/db/children";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

function makeChild(overrides: Partial<Child> = {}): Child {
  return {
    id: "child-1",
    name: "Lena",
    date_of_birth: "2025-03-23",
    sex: "female",
    parent_id: "parent-1",
    created_at: "2025-03-23T00:00:00Z",
    updated_at: "2025-03-23T00:00:00Z",
    ...overrides,
  };
}

describe("ChildHeader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-23"));
  });

  it("renders the child's name as a heading", () => {
    render(<ChildHeader child={makeChild()} />);
    expect(screen.getByRole("heading", { name: /Lena/i })).toBeInTheDocument();
  });

  it("renders the age label", () => {
    render(<ChildHeader child={makeChild()} />);
    expect(screen.getByText(/1 year old/i)).toBeInTheDocument();
  });

  it("shows 'Girl' badge for female", () => {
    render(<ChildHeader child={makeChild()} />);
    expect(screen.getByText("Girl")).toBeInTheDocument();
  });

  it("shows 'Boy' badge for male", () => {
    render(<ChildHeader child={makeChild({ sex: "male", name: "Erik" })} />);
    expect(screen.getByText("Boy")).toBeInTheDocument();
  });

  it("does not render tab navigation (tabs moved to sidebar)", () => {
    render(<ChildHeader child={makeChild()} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
