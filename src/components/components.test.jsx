import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ControlPanel from "./ControlPanel";
import Hero from "./Hero";
import InsightCards from "./InsightCards";
import ShortcutReference from "./ShortcutReference";
import ThemeToggle from "./ThemeToggle";
import UuidList from "./UuidList";

const defaultOptions = {
  uppercase: false,
  trimHyphens: false,
  wrapBraces: false,
};

describe("Hero", () => {
  it("renders the headline and optional feedback", () => {
    render(<Hero feedback="Copied!" />);
    expect(screen.getByText(/Instant UUID generator built for flow/i)).toBeInTheDocument();
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});

describe("InsightCards", () => {
  it("lists the provided insight stats", () => {
    render(<InsightCards insights={[{ label: "Batch", value: 3 }]} />);
    expect(screen.getByText("Batch")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});

describe("ThemeToggle", () => {
  it("calls back when toggled", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<ThemeToggle theme="dark" onToggle={onToggle} />);

    await user.click(
      screen.getByRole("button", { name: /switch to light mode/i })
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders sun icon and label in light mode", () => {
    const { container } = render(
      <ThemeToggle theme="light" onToggle={() => { }} />
    );
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i })
    ).toBeInTheDocument();
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(1);
    expect(screen.getByText(/light mode/i)).toBeInTheDocument();
  });
});

describe("UuidList", () => {
  it("renders UUID entries with copy buttons", () => {
    const onCopy = vi.fn();
    render(<UuidList uuids={["uuid-1"]} copiedUuid="uuid-1" onCopy={onCopy} />);
    fireEvent.click(screen.getByRole("button", { name: /copied/i }));
    expect(onCopy).toHaveBeenCalledWith("uuid-1");
  });
});

describe("ControlPanel", () => {
  it("wires controls to provided callbacks", async () => {
    const onBatchChange = vi.fn();
    const onBatchCommit = vi.fn();
    const onVersionChange = vi.fn();
    const onToggleOption = vi.fn();
    const onGenerate = vi.fn();
    const user = userEvent.setup();

    render(
      <ControlPanel
        batchSize={5}
        visibleBatchSize={5}
        selectedVersion="v4"
        options={defaultOptions}
        onBatchChange={onBatchChange}
        onBatchCommit={onBatchCommit}
        onVersionChange={onVersionChange}
        onToggleOption={onToggleOption}
        onGenerate={onGenerate}
        clipboardSupported={false}
      />
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "6" } });
    expect(onBatchChange).toHaveBeenCalledWith(6);

    fireEvent.pointerUp(slider);
    expect(onBatchCommit).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Version 4/i }));
    expect(onVersionChange).toHaveBeenCalledWith("v4");

    const toggle = screen.getAllByRole("checkbox")[0];
    await user.click(toggle);
    expect(onToggleOption).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Generate/i }));
    expect(onGenerate).toHaveBeenCalled();

    expect(screen.getByText(/Clipboard API is disabled/i)).toBeInTheDocument();
  });
});

describe("ShortcutReference", () => {
  const mockShortcuts = [
    { combo: "⌘ + K", description: "Open command palette" },
    { combo: "⌘ + S", description: "Save file" },
  ];

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(
      <ShortcutReference
        isOpen={true}
        shortcuts={mockShortcuts}
        onClose={onClose}
      />
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close on other keys", () => {
    const onClose = vi.fn();
    render(
      <ShortcutReference
        isOpen={true}
        shortcuts={mockShortcuts}
        onClose={onClose}
      />
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <ShortcutReference
        isOpen={false}
        shortcuts={mockShortcuts}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders dialog with shortcuts when isOpen is true", () => {
    render(
      <ShortcutReference
        isOpen={true}
        shortcuts={mockShortcuts}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
    expect(screen.getByText("⌘ + K")).toBeInTheDocument();
    expect(screen.getByText("Open command palette")).toBeInTheDocument();
    expect(screen.getByText("⌘ + S")).toBeInTheDocument();
    expect(screen.getByText("Save file")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(
      <ShortcutReference
        isOpen={true}
        shortcuts={mockShortcuts}
        onClose={vi.fn()}
      />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Keyboard shortcuts");
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ShortcutReference
        isOpen={true}
        shortcuts={mockShortcuts}
        onClose={onClose}
      />
    );
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ShortcutReference
        isOpen={true}
        shortcuts={mockShortcuts}
        onClose={onClose}
      />
    );
    const backdrop = container.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
