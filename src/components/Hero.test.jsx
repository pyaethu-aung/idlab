import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Hero from "./Hero";

describe("Hero Component", () => {
  it("renders key hero elements", () => {
    render(<Hero />);

    expect(screen.getByText(/Mint/i)).toBeInTheDocument();
    expect(screen.getByText(/RFC 4122/i)).toBeInTheDocument();
    expect(screen.getByText(/at the speed of a keypress/i)).toBeInTheDocument();
  });

  it("renders the hero section with correct aria-label", () => {
    render(<Hero />);
    const section = screen.getByLabelText("Hero");
    expect(section).toBeInTheDocument();
  });

  it("renders the h1 heading", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
  });
});
