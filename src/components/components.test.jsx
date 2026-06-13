import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ControlPanel from "./ControlPanel";
import Hero from "./Hero";
import ShortcutReference from "./ShortcutReference";
import ThemeToggle from "./ThemeToggle";
import ToolbarNav from "./ToolbarNav";
import UuidList from "./UuidList";
import ValidationBanner from "./ValidationBanner";
import ValidatorPropsGrid from "./ValidatorPropsGrid";
import ValidatorSegCard from "./ValidatorSegCard";

const defaultOptions = {
  uppercase: false,
  trimHyphens: false,
  wrapBraces: false,
};

describe("ValidationBanner", () => {
  it("renders nothing for null result", () => {
    const { container } = render(<ValidationBanner result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders invalid banner for invalid result", () => {
    render(<ValidationBanner result={{ valid: false }} />);
    expect(screen.getByRole("status")).toHaveTextContent("Invalid UUID");
  });

  it("renders valid banner for v4 result", () => {
    render(
      <ValidationBanner
        result={{ valid: true, version: 4, charCount: 36, variantBits: "RFC 4122 · 10x · b00…b01", isNil: false, decoded: null }}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("Valid");
    expect(screen.getByRole("status")).toHaveTextContent("UUID v4");
  });

  it("renders valid banner for v7 result with decoded", () => {
    render(
      <ValidationBanner
        result={{ valid: true, version: 7, charCount: 36, variantBits: "RFC 4122 · 10x · b00…b01", isNil: false, decoded: {} }}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("UUID v7");
  });
});

describe("Hero", () => {
  it("renders the headline", () => {
    render(<Hero />);
    expect(screen.getByText(/Mint/i)).toBeInTheDocument();
    expect(screen.getByText(/RFC 4122/i)).toBeInTheDocument();
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

  it("renders sun icon in dark mode and moon icon in light mode", () => {
    const { rerender, container } = render(
      <ThemeToggle theme="dark" onToggle={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: /switch to light mode/i })
    ).toBeInTheDocument();
    expect(container.querySelectorAll("svg")).toHaveLength(1);

    rerender(<ThemeToggle theme="light" onToggle={() => {}} />);
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i })
    ).toBeInTheDocument();
  });
});

describe("UuidList", () => {
  const baseProps = {
    uuids: ["uuid-1"],
    version: "v4",
    batch: 1,
    opts: defaultOptions,
    copiedUuid: "",
    onCopy: vi.fn(),
    onCopyAll: vi.fn(),
    onRegen: vi.fn(),
    onDownload: vi.fn(),
    refreshing: false,
  };

  it("renders UUID rows with copy buttons", () => {
    const onCopy = vi.fn();
    render(<UuidList {...baseProps} onCopy={onCopy} />);
    expect(screen.getAllByText(/uuid/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /copy uuid/i })).toBeInTheDocument();
  });

  it("shows copied state on matching UUID", () => {
    render(<UuidList {...baseProps} copiedUuid="uuid-1" />);
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("wires regenerate, copy all, and download buttons", async () => {
    const onRegen = vi.fn();
    const onCopyAll = vi.fn();
    const onDownload = vi.fn();
    const user = userEvent.setup();

    render(
      <UuidList
        {...baseProps}
        onRegen={onRegen}
        onCopyAll={onCopyAll}
        onDownload={onDownload}
      />
    );

    await user.click(screen.getByRole("button", { name: /regenerate/i }));
    expect(onRegen).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /copy all/i }));
    expect(onCopyAll).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /download/i }));
    expect(onDownload).toHaveBeenCalled();
  });

  it("sets aria-busy on regenerate button when refreshing", () => {
    render(<UuidList {...baseProps} refreshing={true} />);
    expect(screen.getByRole("button", { name: /regenerate/i })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });
});

describe("ControlPanel", () => {
  it("wires controls to provided callbacks", async () => {
    const onBatchChange = vi.fn();
    const onBatchCommit = vi.fn();
    const onVersionChange = vi.fn();
    const onToggleOption = vi.fn();
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
      />
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "6" } });
    expect(onBatchChange).toHaveBeenCalledWith(6);

    fireEvent.pointerUp(slider);
    expect(onBatchCommit).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Random/i }));
    expect(onVersionChange).toHaveBeenCalledWith("v4");

    const toggle = screen.getByRole("button", { name: /uppercase/i });
    fireEvent.click(toggle);
    expect(onToggleOption).toHaveBeenCalled();
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
    expect(screen.getByText("keyboard shortcuts")).toBeInTheDocument();
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

describe("ValidatorSegCard", () => {
  const V4_FIELDS = {
    timeLow: "550e8400",
    timeMid: "e29b",
    timeHighAndVersion: "41d4",
    clockSeqAndReserved: "a716",
    node: "446655440000",
  };

  it("renders nothing for null fields", () => {
    const { container } = render(<ValidatorSegCard fields={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all 5 segment values for valid fields", () => {
    render(<ValidatorSegCard fields={V4_FIELDS} />);
    expect(screen.getByText("550e8400")).toBeInTheDocument();
    expect(screen.getByText("e29b")).toBeInTheDocument();
    expect(screen.getByText("41d4")).toBeInTheDocument();
    expect(screen.getByText("a716")).toBeInTheDocument();
    expect(screen.getByText("446655440000")).toBeInTheDocument();
  });

  it("labels version segment with version + rand caption", () => {
    render(<ValidatorSegCard fields={V4_FIELDS} />);
    expect(screen.getByText("version + rand")).toBeInTheDocument();
  });
});

describe("ValidatorPropsGrid", () => {
  const V4_RESULT = {
    valid: true,
    version: 4,
    variantBits: "RFC 4122 · 10x · b00…b01",
    isLowercase: true,
    hasHyphens: true,
    hasBraces: false,
    isNil: false,
    format: "canonical",
    charCount: 36,
    decoded: null,
  };

  it("renders nothing when result is null", () => {
    const { container } = render(<ValidatorPropsGrid result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when result is invalid", () => {
    const { container } = render(<ValidatorPropsGrid result={{ valid: false }} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders version and variant rows", () => {
    render(<ValidatorPropsGrid result={V4_RESULT} />);
    expect(screen.getByText("version")).toBeInTheDocument();
    expect(screen.getByText("variant")).toBeInTheDocument();
  });

  it("shows dash for timestamp when version has no decoded data", () => {
    render(<ValidatorPropsGrid result={V4_RESULT} />);
    expect(screen.getByText("timestamp")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows decoded timestamp when available", () => {
    const withDecoded = {
      ...V4_RESULT,
      version: 7,
      decoded: { timestampRelative: "2 minutes ago", timestampIso: "2024-01-01T00:00:00.001Z" },
    };
    render(<ValidatorPropsGrid result={withDecoded} />);
    expect(screen.getByText(/2024-01-01 00:00:00 UTC/)).toBeInTheDocument();
  });

  it("renders core property labels", () => {
    render(<ValidatorPropsGrid result={V4_RESULT} />);
    ["version", "variant", "timestamp", "input", "nil uuid?"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("collapses format/length/casing into a single input row", () => {
    render(<ValidatorPropsGrid result={V4_RESULT} />);
    expect(screen.getByText(/canonical · 8-4-4-4-12 · 36 chars · lowercase/)).toBeInTheDocument();
    expect(screen.queryByText("format")).not.toBeInTheDocument();
    expect(screen.queryByText("length")).not.toBeInTheDocument();
    expect(screen.queryByText("lowercase")).not.toBeInTheDocument();
  });
});

describe("ToolbarNav", () => {
  it("renders Generator and Validator buttons", () => {
    render(<ToolbarNav activeTab="generator" onTabChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Generator" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Validator" })).toBeInTheDocument();
  });

  it("marks the active tab with aria-current", () => {
    render(<ToolbarNav activeTab="generator" onTabChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Generator" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Validator" })).not.toHaveAttribute("aria-current");
  });

  it("calls onTabChange when clicking the inactive tab", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<ToolbarNav activeTab="generator" onTabChange={onTabChange} />);
    await user.click(screen.getByRole("button", { name: "Validator" }));
    expect(onTabChange).toHaveBeenCalledWith("validator");
  });

  it("does not call onTabChange when clicking the active tab", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<ToolbarNav activeTab="generator" onTabChange={onTabChange} />);
    await user.click(screen.getByRole("button", { name: "Generator" }));
    expect(onTabChange).not.toHaveBeenCalled();
  });
});
