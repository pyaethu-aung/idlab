import { StrictMode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CodeSnippets from "./CodeSnippets";
import useCodeSnippets from "../hooks/useCodeSnippets";
import { snippetsFor } from "../data/codeSnippets";
import ControlPanel from "./ControlPanel";
import ConvertPanel from "./ConvertPanel";
import Hero from "./Hero";
import ShortcutReference from "./ShortcutReference";
import TabAnnouncer from "./TabAnnouncer";
import ThemeToggle from "./ThemeToggle";
import ToolbarNav from "./ToolbarNav";
import UlidPanel from "./UlidPanel";
import UuidList from "./UuidList";
import ValidationBanner from "./ValidationBanner";
import ValidatorConvert from "./ValidatorConvert";
import ValidatorPanel from "./ValidatorPanel";
import ValidatorPropsGrid from "./ValidatorPropsGrid";
import ValidatorSegCard from "./ValidatorSegCard";
import { parseUuidList } from "../utils/uuidBulk";

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
  it("renders the default UUID headline", () => {
    render(<Hero />);
    expect(screen.getByText(/Mint/i)).toBeInTheDocument();
    expect(screen.getByText(/RFC 4122/i)).toBeInTheDocument();
  });

  it("renders a custom headline, accent, and subtitle from props", () => {
    render(
      <Hero
        lead="Mint "
        accent="time-sortable"
        trail=" ids"
        line2="ordered to the millisecond."
        sub="Generate ULIDs and decode them in place."
      />
    );
    expect(screen.getByText("time-sortable")).toBeInTheDocument();
    expect(screen.getByText(/ordered to the millisecond/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Generate ULIDs and decode them in place/i)
    ).toBeInTheDocument();
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

  it("hides the timestamp section unless a time-based version is active", () => {
    const { rerender } = render(
      <ControlPanel
        batchSize={5}
        visibleBatchSize={5}
        selectedVersion="v4"
        isTimeBased={false}
        options={defaultOptions}
        onBatchChange={() => {}}
        onBatchCommit={() => {}}
        onVersionChange={() => {}}
        onToggleOption={() => {}}
      />
    );
    expect(screen.queryByRole("group", { name: /Timestamp source/i })).toBeNull();

    rerender(
      <ControlPanel
        batchSize={5}
        visibleBatchSize={5}
        selectedVersion="v7"
        isTimeBased
        timestampMode="now"
        pinnedTime=""
        pinnedMsecs={null}
        options={defaultOptions}
        onBatchChange={() => {}}
        onBatchCommit={() => {}}
        onVersionChange={() => {}}
        onToggleOption={() => {}}
      />
    );
    expect(screen.getByRole("group", { name: /Timestamp source/i })).toBeTruthy();
    // The moment inputs only appear once "pinned" is chosen.
    expect(screen.queryByLabelText(/Date to embed/i)).toBeNull();
    expect(screen.queryByLabelText(/Time to embed/i)).toBeNull();
  });

  it("composes date and time inputs into one moment, with a decoded readout", () => {
    const onTimestampModeChange = vi.fn();
    const onTimestampChange = vi.fn();

    render(
      <ControlPanel
        batchSize={5}
        visibleBatchSize={5}
        selectedVersion="v7"
        isTimeBased
        timestampMode="pinned"
        pinnedTime="2021-01-01T12:30:00"
        pinnedMsecs={1609504200000}
        options={defaultOptions}
        onBatchChange={() => {}}
        onBatchCommit={() => {}}
        onVersionChange={() => {}}
        onTimestampModeChange={onTimestampModeChange}
        onTimestampChange={onTimestampChange}
        onToggleOption={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "now" }));
    expect(onTimestampModeChange).toHaveBeenCalledWith("now");

    // Changing the date keeps the existing time; changing the time keeps the date.
    const dateInput = screen.getByLabelText(/Date to embed/i);
    fireEvent.change(dateInput, { target: { value: "2022-02-02" } });
    expect(onTimestampChange).toHaveBeenCalledWith("2022-02-02T12:30:00");

    const timeInput = screen.getByLabelText(/Time to embed/i);
    fireEvent.change(timeInput, { target: { value: "08:15" } });
    expect(onTimestampChange).toHaveBeenCalledWith("2021-01-01T08:15");

    // Readout echoes the epoch ms and the decoded UTC instant.
    expect(screen.getByText("1609504200000")).toBeTruthy();
    expect(screen.getByText(/2021-01-01T12:30:00\.000Z/)).toBeTruthy();
  });

  it("shows a live-time fallback hint when the pinned time is blank", () => {
    render(
      <ControlPanel
        batchSize={5}
        visibleBatchSize={5}
        selectedVersion="v1"
        isTimeBased
        timestampMode="pinned"
        pinnedTime=""
        pinnedMsecs={null}
        options={defaultOptions}
        onBatchChange={() => {}}
        onBatchCommit={() => {}}
        onVersionChange={() => {}}
        onTimestampModeChange={() => {}}
        onTimestampChange={() => {}}
        onToggleOption={() => {}}
      />
    );

    expect(screen.getByText(/Using live time until you pick a moment/i)).toBeTruthy();
    // The decoded readout is suppressed while no valid moment is pinned.
    expect(screen.queryByText("1609504200000")).toBeNull();
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
  it("renders the three ID family buttons", () => {
    render(<ToolbarNav activeTab="generator" onTabChange={() => {}} />);
    expect(screen.getByRole("button", { name: "UUID" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ULID" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NanoID" })).toBeInTheDocument();
  });

  it("marks the active family with aria-current", () => {
    render(<ToolbarNav activeTab="generator" onTabChange={() => {}} />);
    expect(screen.getByRole("button", { name: "UUID" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "ULID" })).not.toHaveAttribute("aria-current");
  });

  it("treats every UUID mode as the active UUID family", () => {
    render(<ToolbarNav activeTab="converter" onTabChange={() => {}} />);
    expect(screen.getByRole("button", { name: "UUID" })).toHaveAttribute("aria-current", "page");
  });

  it("navigates to a family's first mode when no last-used mode is known", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<ToolbarNav activeTab="ulid" onTabChange={onTabChange} />);
    await user.click(screen.getByRole("button", { name: "UUID" }));
    expect(onTabChange).toHaveBeenCalledWith("generator");
  });

  it("returns to the family's last-used mode when one is remembered", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ToolbarNav
        activeTab="ulid"
        onTabChange={onTabChange}
        lastLeafByFamily={{ uuid: "validator" }}
      />
    );
    await user.click(screen.getByRole("button", { name: "UUID" }));
    expect(onTabChange).toHaveBeenCalledWith("validator");
  });

  it("advertises the jump key only on single-mode family tabs", () => {
    render(<ToolbarNav activeTab="generator" onTabChange={() => {}} />);
    expect(screen.getByRole("button", { name: "ULID" })).toHaveAttribute(
      "aria-keyshortcuts",
      "Alt+Shift+4"
    );
    expect(screen.getByRole("button", { name: "NanoID" })).toHaveAttribute(
      "aria-keyshortcuts",
      "Alt+Shift+5"
    );
    // UUID owns three jump keys, so the family tab advertises none.
    expect(screen.getByRole("button", { name: "UUID" })).not.toHaveAttribute(
      "aria-keyshortcuts"
    );
  });

  it("does not call onTabChange when clicking the active family", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<ToolbarNav activeTab="generator" onTabChange={onTabChange} />);
    await user.click(screen.getByRole("button", { name: "UUID" }));
    expect(onTabChange).not.toHaveBeenCalled();
  });
});

describe("TabAnnouncer", () => {
  it("stays silent on the initial render", () => {
    render(<TabAnnouncer activeTab="generator" />);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("stays silent on initial render under StrictMode", () => {
    // StrictMode double-invokes effects on mount; a boolean first-render flag
    // would flip and then announce the default tab on load. The previous-value
    // comparison must keep the region silent.
    render(
      <StrictMode>
        <TabAnnouncer activeTab="generator" />
      </StrictMode>
    );
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("announces the new tab label when the active tab changes", () => {
    const { rerender } = render(<TabAnnouncer activeTab="generator" />);
    rerender(<TabAnnouncer activeTab="ulid" />);
    expect(screen.getByRole("status")).toHaveTextContent("ULID tab");
  });

  it("re-announces family and mode on every subsequent change", () => {
    const { rerender } = render(<TabAnnouncer activeTab="generator" />);
    rerender(<TabAnnouncer activeTab="validator" />);
    expect(screen.getByRole("status")).toHaveTextContent("UUID Validate tab");
    rerender(<TabAnnouncer activeTab="nanoid" />);
    expect(screen.getByRole("status")).toHaveTextContent("NanoID tab");
  });

  it("exposes a polite, atomic live region", () => {
    render(<TabAnnouncer activeTab="generator" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
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

const ULID_RESULT = {
  valid: true,
  kind: "ulid",
  ulid: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  timestampMs: 1469918176385,
  timestamp: new Date(1469918176385),
  timestampIso: "2016-07-30T23:36:16.385Z",
  timestampRelative: "9 years ago",
  randomness: "0xb5cdd6e6f0e2502c2fab",
  randomnessChars: "TSV4RRFFQ69G5FAV",
  uuid: "0156fbce-d6e2-71f9-89d8-c81e2502c2fab".slice(0, 36),
  uuidCompact: "0156fbced6e271f989d8c81e2502c2fa",
};

const makeUlid = (overrides = {}) => ({
  rawInput: "",
  setRawInput: vi.fn(),
  result: null,
  hasInput: false,
  generate: vi.fn(),
  clearInput: vi.fn(),
  loadSample: vi.fn(),
  activeSample: null,
  copiedKey: null,
  copyValue: vi.fn(),
  ...overrides,
});

describe("UlidPanel", () => {
  it("shows the empty-state prompt when there is no input", () => {
    render(<UlidPanel ulid={makeUlid()} />);
    expect(screen.getByText("mint or paste a ULID to decode")).toBeInTheDocument();
  });

  it("shows the decode error reason when input is invalid", () => {
    render(
      <UlidPanel
        ulid={makeUlid({
          rawInput: "nope",
          hasInput: true,
          result: { valid: false, reason: "not a ULID or UUID" },
        })}
      />
    );
    expect(screen.getByText("not a ULID or UUID")).toBeInTheDocument();
  });

  it("renders decoded fields and representation rows for a valid ULID", () => {
    render(
      <UlidPanel ulid={makeUlid({ rawInput: ULID_RESULT.ulid, hasInput: true, result: ULID_RESULT })} />
    );
    expect(screen.getByText("valid ULID")).toBeInTheDocument();
    expect(screen.getByText(ULID_RESULT.randomness)).toBeInTheDocument();
    expect(screen.getByText(String(ULID_RESULT.timestampMs))).toBeInTheDocument();
    expect(screen.getByText("compact")).toBeInTheDocument();
    expect(screen.getByText(ULID_RESULT.uuidCompact)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Copy / })).toHaveLength(3);
  });

  it("labels a UUIDv7 conversion result", () => {
    render(
      <UlidPanel
        ulid={makeUlid({
          rawInput: "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d",
          hasInput: true,
          result: { ...ULID_RESULT, kind: "uuidv7" },
        })}
      />
    );
    expect(screen.getByText("valid UUIDv7")).toBeInTheDocument();
  });

  it("calls generate when the mint button is clicked", async () => {
    const generate = vi.fn();
    const user = userEvent.setup();
    render(<UlidPanel ulid={makeUlid({ generate })} />);
    await user.click(screen.getByRole("button", { name: "Mint a ULID" }));
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("calls copyValue with the row key when a copy button is clicked", async () => {
    const copyValue = vi.fn();
    const user = userEvent.setup();
    render(
      <UlidPanel ulid={makeUlid({ rawInput: ULID_RESULT.ulid, hasInput: true, result: ULID_RESULT, copyValue })} />
    );
    await user.click(screen.getByRole("button", { name: "Copy ulid" }));
    expect(copyValue).toHaveBeenCalledWith("ulid", ULID_RESULT.ulid);
  });

  it("reflects the copied state on the matching row button", () => {
    render(
      <UlidPanel
        ulid={makeUlid({ rawInput: ULID_RESULT.ulid, hasInput: true, result: ULID_RESULT, copiedKey: "uuid" })}
      />
    );
    expect(screen.getByRole("button", { name: "Copied" })).toHaveTextContent("✓ copied");
  });

  it("calls clearInput when the clear button is clicked", async () => {
    const clearInput = vi.fn();
    const user = userEvent.setup();
    render(<UlidPanel ulid={makeUlid({ rawInput: ULID_RESULT.ulid, clearInput })} />);
    await user.click(screen.getByRole("button", { name: "Clear input" }));
    expect(clearInput).toHaveBeenCalled();
  });

  it("loads a sample when a sample pill is clicked", async () => {
    const loadSample = vi.fn();
    const user = userEvent.setup();
    render(<UlidPanel ulid={makeUlid({ loadSample })} />);
    await user.click(screen.getByRole("button", { name: "Load uuidv7 sample" }));
    expect(loadSample).toHaveBeenCalledWith("uuidv7");
  });
});

const VALIDATOR_OPTIONS = { strictRfc: false, allowBraces: true, allowNoHyphens: false };
const V1 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const makeValidator = (overrides = {}) => ({
  rawInput: "",
  setRawInput: vi.fn(),
  options: VALIDATOR_OPTIONS,
  toggleOption: vi.fn(),
  parsed: null,
  summary: null,
  validCount: 0,
  filteredRows: [],
  expandedLine: null,
  toggleRow: vi.fn(),
  conversion: null,
  conversionCopied: false,
  copyConversion: vi.fn(),
  copyValid: vi.fn(),
  copiedAll: false,
  copyOne: vi.fn(),
  copiedLine: null,
  clearInput: vi.fn(),
  loadSample: vi.fn(),
  loadSampleList: vi.fn(),
  activeSample: null,
  assertVersion: null,
  setAssertVersion: vi.fn(),
  assertSummary: null,
  tableFilter: "all",
  setTableFilter: vi.fn(),
  ...overrides,
});

const withList = (text, overrides = {}) => {
  const parsed = parseUuidList(text, VALIDATOR_OPTIONS);
  return makeValidator({
    rawInput: text,
    parsed,
    summary: parsed.summary,
    validCount: parsed.summary.valid,
    filteredRows: parsed.rows,
    ...overrides,
  });
};

describe("ValidatorPanel", () => {
  it("shows the empty-state prompt when there is no input", () => {
    render(<ValidatorPanel validator={makeValidator()} />);
    expect(screen.getByText("paste one or more uuids to validate")).toBeInTheDocument();
  });

  it("renders the summary count and one row per parsed line", () => {
    render(<ValidatorPanel validator={withList([V4, "not-a-uuid"].join("\n"))} />);
    expect(screen.getByText(V4)).toBeInTheDocument();
    expect(screen.getByText("not-a-uuid")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /details for line/ })
    ).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Copy all valid UUIDs" })).toHaveTextContent("copy 1 valid");
  });

  it("calls toggleRow with the line number when an expand button is clicked", async () => {
    const toggleRow = vi.fn();
    const user = userEvent.setup();
    render(<ValidatorPanel validator={withList([V4, V1].join("\n"), { toggleRow })} />);
    await user.click(screen.getByRole("button", { name: "Expand details for line 1" }));
    expect(toggleRow).toHaveBeenCalledWith(1);
  });

  it("renders the inspector detail for the expanded row", () => {
    render(<ValidatorPanel validator={withList([V4, V1].join("\n"), { expandedLine: 1 })} />);
    expect(screen.getByRole("button", { name: "Collapse details for line 1" })).toBeInTheDocument();
    expect(screen.getByText(/Valid · UUID v4/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy this UUID" })).toBeInTheDocument();
  });

  it("surfaces the v1→v6 conversion inside an expanded time-based row", () => {
    const conversion = { from: 1, to: 6, value: "1d19dad6-ba7b-6810-80b4-00c04fd430c8" };
    render(<ValidatorPanel validator={withList(V1, { expandedLine: 1, conversion })} />);
    expect(screen.getByText("v1 → v6")).toBeInTheDocument();
    expect(screen.getByText(conversion.value)).toBeInTheDocument();
  });

  it("renders the upload file button", () => {
    render(<ValidatorPanel validator={makeValidator()} />);
    expect(screen.getByRole("button", { name: "Upload a file" })).toBeInTheDocument();
  });

  it("wires copy-all, copy-one, clear, sample, and sample-list controls", async () => {
    const copyValid = vi.fn();
    const copyOne = vi.fn();
    const clearInput = vi.fn();
    const loadSample = vi.fn();
    const loadSampleList = vi.fn();
    const user = userEvent.setup();
    render(
      <ValidatorPanel
        validator={withList(V4, {
          expandedLine: 1,
          copyValid,
          copyOne,
          clearInput,
          loadSample,
          loadSampleList,
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: "Copy all valid UUIDs" }));
    expect(copyValid).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Copy this UUID" }));
    expect(copyOne).toHaveBeenCalledWith(1, V4);

    await user.click(screen.getByRole("button", { name: "Clear input" }));
    expect(clearInput).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Load a sample list" }));
    expect(loadSampleList).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Load v4 sample UUID" }));
    expect(loadSample).toHaveBeenCalledWith("v4");
  });
});

describe("ValidatorPanel file upload", () => {
  function stubFileReader(contentQueue) {
    const queue = [...contentQueue];
    vi.stubGlobal(
      "FileReader",
      vi.fn().mockImplementation(function () {
        this.onload = null;
        this.onerror = null;
        this.readAsText = () => {
          const content = queue.shift() ?? "";
          Promise.resolve().then(() => this.onload?.({ target: { result: content } }));
        };
      })
    );
  }

  afterEach(() => vi.unstubAllGlobals());

  it("loads a single file's text into the validator input", async () => {
    const setRawInput = vi.fn();
    const content = "uuid-a\nuuid-b";
    stubFileReader([content]);

    render(<ValidatorPanel validator={makeValidator({ setRawInput })} />);

    const file = new File([content], "uuids.txt", { type: "text/plain" });
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, file);

    await waitFor(() => expect(setRawInput).toHaveBeenCalledWith(content));
  });

  it("concatenates multiple files separated by a newline", async () => {
    const setRawInput = vi.fn();
    stubFileReader(["line-a", "line-b"]);

    render(<ValidatorPanel validator={makeValidator({ setRawInput })} />);

    const files = [
      new File(["line-a"], "a.txt", { type: "text/plain" }),
      new File(["line-b"], "b.txt", { type: "text/plain" }),
    ];
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, files);

    await waitFor(() => expect(setRawInput).toHaveBeenCalledWith("line-a\nline-b"));
  });

  it("shows an error and skips a file over 1 MB", () => {
    const setRawInput = vi.fn();
    render(<ValidatorPanel validator={makeValidator({ setRawInput })} />);

    const bigFile = new File(["x".repeat(1_000_001)], "huge.txt", { type: "text/plain" });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [bigFile] } });

    expect(screen.getByRole("alert")).toHaveTextContent("huge.txt exceeds 1 MB");
    expect(setRawInput).not.toHaveBeenCalled();
  });

  it("loads readable files and reports skipped oversized ones", async () => {
    const setRawInput = vi.fn();
    stubFileReader(["uuid-ok"]);

    render(<ValidatorPanel validator={makeValidator({ setRawInput })} />);

    const bigFile = new File(["x".repeat(1_000_001)], "huge.txt", { type: "text/plain" });
    const okFile = new File(["uuid-ok"], "ok.txt", { type: "text/plain" });
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, [bigFile, okFile]);

    expect(screen.getByRole("alert")).toHaveTextContent("huge.txt exceeds 1 MB");
    await waitFor(() => expect(setRawInput).toHaveBeenCalledWith("uuid-ok"));
  });
});

describe("CodeSnippets", () => {
  afterEach(() => vi.unstubAllGlobals());

  // CodeSnippets is a pure renderer of useCodeSnippets; the harness supplies
  // real hook state so the tests exercise the component as App wires it.
  function Harness({ version }) {
    const snippets = useCodeSnippets(snippetsFor(version));
    return <CodeSnippets version={version} snippets={snippets} />;
  }

  it("renders the version header, one row per language, full programs by default", () => {
    render(<Harness version="v4" />);
    expect(screen.getByText("/ snippets · v4")).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(screen.getByText("js")).toBeInTheDocument();
    // Code is split into syntax-highlight spans, so assert on the row's
    // concatenated textContent rather than a single text node. Full mode is
    // the default: the js block is the complete program.
    expect(items.some((li) => li.textContent.includes("console.log(uuidv4())"))).toBe(true);
  });

  it("flips to the inline one-liner when the toggle is pressed", () => {
    render(<Harness version="v4" />);
    fireEvent.click(screen.getByRole("button", { name: "inline" }));
    const items = screen.getAllByRole("listitem");
    expect(items.some((li) => li.textContent.includes("import uuid; uuid.uuid4()"))).toBe(true);
  });

  it("renders nothing for the nil and max sentinels", () => {
    const { container, rerender } = render(<Harness version="nil" />);
    expect(container.firstChild).toBeNull();
    rerender(<Harness version="max" />);
    expect(container.firstChild).toBeNull();
  });

  it("copies the full program and reflects the copied state", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    render(<Harness version="v4" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy py program" }));
    expect(writeText).toHaveBeenCalledWith("import uuid\n\nprint(uuid.uuid4())");
    expect(
      await screen.findByRole("button", { name: "Copied" })
    ).toHaveTextContent("✓ copied");
  });
});
