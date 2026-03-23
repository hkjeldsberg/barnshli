import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("is not disabled by default", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("disables the button when disabled prop is true", () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables and marks aria-busy when loading", () => {
    render(<Button loading>Saving…</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("shows spinner icon when loading", () => {
    const { container } = render(<Button loading>Saving…</Button>);
    const spinner = container.querySelector("[aria-hidden='true']");
    expect(spinner).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies destructive variant class", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild as HTMLElement).toHaveClass("bg-dusty-rose");
  });

  it("applies size class for lg", () => {
    const { container } = render(<Button size="lg">Big</Button>);
    expect((container.firstChild as HTMLElement).className).toContain("px-6");
  });

  it("passes through additional props", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
