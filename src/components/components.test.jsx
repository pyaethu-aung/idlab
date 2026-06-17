import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ControlPanel from "./ControlPanel";
import ConvertPanel from "./ConvertPanel";
import Hero from "./Hero";
import ShortcutReference from "./ShortcutReference";
import ThemeToggle from "./ThemeToggle";
import ToolbarNav from "./ToolbarNav";
import UuidList from "./UuidList";
import ValidationBanner from "./ValidationBanner";
import ValidatorConvert from "./ValidatorConvert";
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

describe("ValidatorConvert", () => {
  const CONVERSION = {
    from: 1,
    to: 6,
    value: "1d19dad6-ba7b-6810-80b4-00c04fd430c8",
  };

  it("renders nothing when there is no conversion", () => {
    const { container } = render(
      <ValidatorConvert conversion={null} copied={false} onCopy={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows the route and converted value", () => {
    render(<ValidatorConvert conversion={CONVERSION} copied={false} onCopy={() => {}} />);
    expect(screen.getByText("v1 → v6")).toBeInTheDocument();
    expect(screen.getByText(CONVERSION.value)).toBeInTheDocument();
  });

  it("calls onCopy when the copy button is clicked", async () => {
    const onCopy = vi.fn();
    const user = userEvent.setup();
    render(<ValidatorConvert conversion={CONVERSION} copied={false} onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy version 6 UUID" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("reflects the copied state on the button", () => {
    render(<ValidatorConvert conversion={CONVERSION} copied={true} onCopy={() => {}} />);
    expect(screen.getByRole("button", { name: "Copied" })).toHaveTextContent("copied");
  });
});

const V4 = "550e8400-e29b-41d4-a716-446655440000";

const makeConverter = (overrides = {}) => ({
  rawInput: "",
  setRawInput: vi.fn(),
  conversions: null,
  hasInput: false,
  copiedKey: null,
  copyRow: vi.fn(),
  clearInput: vi.fn(),
  ...overrides,
});

describe("ConvertPanel", () => {
  it("shows empty-state prompt when input is empty", () => {
    render(<ConvertPanel converter={makeConverter()} />);
    expect(screen.getByText("paste a UUID to convert")).toBeInTheDocument();
  });

  it("shows error hint when input is present but invalid", () => {
    render(<ConvertPanel converter={makeConverter({ hasInput: true })} />);
    expect(screen.getByText("not a valid UUID")).toBeInTheDocument();
  });

  it("renders all 9 representation rows when conversions are available", () => {
    const conversions = {
      canonical: V4,
      compact: V4.replace(/-/g, ""),
      upper: V4.toUpperCase(),
      braces: `{${V4}}`,
      urn: `urn:uuid:${V4}`,
      base64: "VQ6EAOKbQdSnFkRmVUQAAA",
      base32: "2N1T201RMV87AAE5J4CSAM8000",
      integer: "113059749145936325402354257176981405696",
      bytes: "[0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x41, 0xd4, 0xa7, 0x16, 0x44, 0x66, 0x55, 0x44, 0x00, 0x00]",
    };
    render(<ConvertPanel converter={makeConverter({ rawInput: V4, conversions, hasInput: true })} />);
    expect(screen.getByText("canonical")).toBeInTheDocument();
    expect(screen.getByText("base64url")).toBeInTheDocument();
    expect(screen.getByText("bytes")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Copy this value" })).toHaveLength(9);
  });

  it("calls copyRow when a copy button is clicked", async () => {
    const copyRow = vi.fn();
    const conversions = {
      canonical: V4, compact: "", upper: "", braces: "", urn: "",
      base64: "", base32: "", integer: "", bytes: "",
    };
    const user = userEvent.setup();
    render(<ConvertPanel converter={makeConverter({ rawInput: V4, conversions, hasInput: true, copyRow })} />);
    await user.click(screen.getAllByRole("button", { name: "Copy this value" })[0]);
    expect(copyRow).toHaveBeenCalledWith("canonical", V4);
  });

  it("reflects copied state on the correct row button", () => {
    const conversions = {
      canonical: V4, compact: "", upper: "", braces: "", urn: "",
      base64: "", base32: "", integer: "", bytes: "",
    };
    render(<ConvertPanel converter={makeConverter({ rawInput: V4, conversions, hasInput: true, copiedKey: "canonical" })} />);
    expect(screen.getByRole("button", { name: "Copied" })).toHaveTextContent("✓ copied");
  });

  it("calls clearInput when clear button is clicked", async () => {
    const clearInput = vi.fn();
    const user = userEvent.setup();
    render(<ConvertPanel converter={makeConverter({ rawInput: V4, clearInput })} />);
    await user.click(screen.getByRole("button", { name: "Clear input" }));
    expect(clearInput).toHaveBeenCalled();
  });

  it("loads a sample UUID when a sample pill is clicked", async () => {
    const setRawInput = vi.fn();
    const user = userEvent.setup();
    render(<ConvertPanel converter={makeConverter({ setRawInput })} />);
    await user.click(screen.getByRole("button", { name: "Load nil sample UUID" }));
    expect(setRawInput).toHaveBeenCalledWith("00000000-0000-0000-0000-000000000000");
  });
});
