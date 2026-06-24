import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockToggleTheme,
  mockRegenerate,
  mockDownloadList,
  mockHandleCopy,
  mockCopyAll,
  mockHandleVersionChange,
  mockToggleOption,
  mockCycleExportFormat,
  mockSetBatchSize,
  mockCommitBatchSize,
  mockSetBatchSizeAndCommit,
  useThemeMock,
  useUuidGeneratorMock,
  useKeyboardShortcutsMock,
} = vi.hoisted(() => ({
  mockToggleTheme: vi.fn(),
  mockRegenerate: vi.fn(),
  mockDownloadList: vi.fn(),
  mockHandleCopy: vi.fn(),
  mockCopyAll: vi.fn(),
  mockHandleVersionChange: vi.fn(),
  mockToggleOption: vi.fn(),
  mockCycleExportFormat: vi.fn(),
  mockSetBatchSize: vi.fn(),
  mockCommitBatchSize: vi.fn(),
  mockSetBatchSizeAndCommit: vi.fn(),
  useThemeMock: vi.fn(),
  useUuidGeneratorMock: vi.fn(),
  useKeyboardShortcutsMock: vi.fn(),
}));

vi.mock("./hooks/useTheme", () => ({
  default: useThemeMock,
}));

vi.mock("./hooks/useUuidGenerator", () => ({
  default: useUuidGeneratorMock,
}));

vi.mock("./hooks/useKeyboardShortcuts", () => ({
  default: useKeyboardShortcutsMock,
}));

const createGeneratorState = (overrides = {}) => ({
  batchSize: 5,
  setBatchSize: mockSetBatchSize,
  setBatchSizeAndCommit: mockSetBatchSizeAndCommit,
  visibleBatchSize: 5,
  selectedVersion: "v4",
  options: { uppercase: false, trimHyphens: false, wrapBraces: false },
  formattedUuids: ["abc-123"],
  copiedUuid: "",
  feedback: "Copied!",
  clipboardSupported: true,
  isRefreshing: false,
  isDownloading: false,
  regenerate: mockRegenerate,
  handleCopy: mockHandleCopy,
  copyAll: mockCopyAll,
  handleVersionChange: mockHandleVersionChange,
  toggleOption: mockToggleOption,
  cycleExportFormat: mockCycleExportFormat,
  downloadList: mockDownloadList,
  commitBatchSize: mockCommitBatchSize,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  // useActiveTab runs for real and reads window.location, and pushState from a
  // prior test persists in jsdom — reset to the canonical default so each test
  // starts on UUID Generate independent of order.
  window.history.replaceState(null, "", "/uuid/generate");
  useThemeMock.mockReturnValue({ theme: "dark", toggleTheme: mockToggleTheme });
  useUuidGeneratorMock.mockReturnValue(createGeneratorState());
});

import App from "./App";

describe("App", () => {
  it("renders core controls and wires primary actions", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/mint\s+identifiers/i)).toBeInTheDocument();
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /switch to light mode/i })
    );
    expect(mockToggleTheme).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /regenerate/i }));
    expect(mockRegenerate).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /download/i }));
    expect(mockDownloadList).toHaveBeenCalled();
  });

  it("shows refreshing state on the regenerate button", () => {
    useUuidGeneratorMock.mockReturnValue(
      createGeneratorState({ isRefreshing: true })
    );

    render(<App />);

    expect(screen.getByRole("button", { name: /regenerate/i })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("integrates useKeyboardShortcuts hook with correct props", () => {
    const state = createGeneratorState();
    useUuidGeneratorMock.mockReturnValue(state);

    render(<App />);

    expect(useKeyboardShortcutsMock).toHaveBeenCalledWith({
      activeTab: "generator",
      batchSize: state.batchSize,
      formattedUuids: state.formattedUuids,
      isShortcutHelpOpen: false,
      setShortcutHelpOpen: expect.any(Function),
      downloadList: state.downloadList,
      handleVersionChange: state.handleVersionChange,
      toggleOption: state.toggleOption,
      toggleValidatorOption: expect.any(Function),
      setBatchSizeAndCommit: state.setBatchSizeAndCommit,
      handleCopy: state.handleCopy,
      cycleExportFormat: state.cycleExportFormat,
      setActiveTab: expect.any(Function),
      tabActions: expect.any(Object),
    });
  });

  it("opens and closes shortcut reference dialog", async () => {
    const user = userEvent.setup();
    render(<App />);

    const shortcutButton = screen.getByRole("button", { name: /open keyboard shortcuts/i });
    await user.click(shortcutButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // The UUID family is active on load, so its mode switcher (Generate / Validate
  // / Convert) drives switching between the three UUID leaves. The switcher is
  // itself a `.main > div`, so panel queries skip it with :not(.mode-switcher).
  it("switches to validator panel when the Validate mode is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Validate" }));

    const panels = container.querySelectorAll(".main > div:not(.mode-switcher)");
    expect(panels[0]).toHaveStyle({ display: "none" });
    expect(panels[1]).not.toHaveStyle({ display: "none" });
  });

  it("switches back to generator when the Generate mode is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Validate" }));
    await user.click(screen.getByRole("button", { name: "Generate" }));

    const panels = container.querySelectorAll(".main > div:not(.mode-switcher)");
    expect(panels[0]).not.toHaveStyle({ display: "none" });
    expect(panels[1]).toHaveStyle({ display: "none" });
  });

  it("switches to converter panel when the Convert mode is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Convert" }));

    const panels = container.querySelectorAll(".main > div:not(.mode-switcher)");
    expect(panels[0]).toHaveStyle({ display: "none" });
    expect(panels[1]).toHaveStyle({ display: "none" });
    expect(panels[2]).not.toHaveStyle({ display: "none" });
  });

  it("keeps all panels in DOM when switching modes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Validate" }));

    // Validator and Converter both render UUID inputs; generator stays mounted too
    expect(screen.getAllByPlaceholderText(/xxxxxxxx-xxxx/i)).toHaveLength(2);
    expect(screen.getByText(/mint\s+identifiers/i)).toBeInTheDocument();
  });

  it("gives the ULID and NanoID sections their own headers", () => {
    render(<App />);
    // Panels stay mounted (display:none), so both family headers are present.
    expect(screen.getByText(/ordered to the millisecond/i)).toBeInTheDocument();
    expect(screen.getByText(/at the length you choose/i)).toBeInTheDocument();
  });

  it("hides the mode switcher for single-mode families and shows it for UUID", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    expect(container.querySelector(".mode-switcher")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "NanoID" }));
    expect(container.querySelector(".mode-switcher")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "UUID" }));
    expect(container.querySelector(".mode-switcher")).toBeInTheDocument();
  });
});
