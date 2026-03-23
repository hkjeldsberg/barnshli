import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders the label text", () => {
    render(<Badge label="WHO" />);
    expect(screen.getByText("WHO")).toBeInTheDocument();
  });

  it("uses default variant when none is provided", () => {
    const { container } = render(<Badge label="Test" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-cream-100");
  });

  it("applies male variant classes", () => {
    const { container } = render(<Badge label="Boy" variant="male" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-sky-blue-100");
  });

  it("applies female variant classes", () => {
    const { container } = render(<Badge label="Girl" variant="female" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-dusty-rose-100");
  });

  it("applies who variant classes", () => {
    const { container } = render(<Badge label="WHO" variant="who" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-sky-blue-100");
  });

  it("merges additional className", () => {
    const { container } = render(<Badge label="Test" className="mt-2" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("mt-2");
  });

  it("renders as a span element", () => {
    const { container } = render(<Badge label="Test" />);
    expect(container.firstChild?.nodeName).toBe("SPAN");
  });
});
