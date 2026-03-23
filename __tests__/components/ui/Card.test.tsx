import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("uses default variant classes when no variant provided", () => {
    const { container } = render(<Card>Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-cream-50");
  });

  it("applies sage variant classes", () => {
    const { container } = render(<Card variant="sage">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-sage-100");
  });

  it("applies rose variant classes", () => {
    const { container } = render(<Card variant="rose">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-dusty-rose-100");
  });

  it("merges custom className", () => {
    const { container } = render(<Card className="p-12">Content</Card>);
    expect((container.firstChild as HTMLElement).className).toContain("p-12");
  });

  it("renders as a div element", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });
});
