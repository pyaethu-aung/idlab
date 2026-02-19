import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockToggleTheme,
  mockRegenerate,
  mockDownloadList,
  mockHandleCopy,
  mockHandleVersionChange,
  mockToggleOption,
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
  mockHandleVersionChange: vi.fn(),
  mockToggleOption: vi.fn(),
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
  handleVersionChange: mockHandleVersionChange,
  toggleOption: mockToggleOption,
  downloadList: mockDownloadList,
  commitBatchSize: mockCommitBatchSize,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  useThemeMock.mockReturnValue({ theme: "dark", toggleTheme: mockToggleTheme });
  useUuidGeneratorMock.mockReturnValue(createGeneratorState());
});

import App from "./App";

describe("App", () => {
  it("renders core controls and wires primary actions", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/Instant UUID generator built for flow/i)).toBeInTheDocument();
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /switch to light mode/i })
    );
    expect(mockToggleTheme).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /refresh/i }));
    expect(mockRegenerate).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /download/i }));
    expect(mockDownloadList).toHaveBeenCalled();
  });

  it("displays busy states while refreshing or downloading", () => {
    useUuidGeneratorMock.mockReturnValue(
      createGeneratorState({ isRefreshing: true, isDownloading: true })
    );

    render(<App />);

    expect(screen.getByRole("button", { name: /refresh/i })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getByRole("button", { name: /Preparing/i })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getByText(/Preparing.../i)).toBeInTheDocument();
  });

  it("integrates useKeyboardShortcuts hook with correct props", () => {
    const state = createGeneratorState();
    useUuidGeneratorMock.mockReturnValue(state);

    render(<App />);

    expect(useKeyboardShortcutsMock).toHaveBeenCalledWith({
      batchSize: state.batchSize,
      formattedUuids: state.formattedUuids,
      isShortcutHelpOpen: false,
      setShortcutHelpOpen: expect.any(Function),
      regenerate: state.regenerate,
      downloadList: state.downloadList,
      handleVersionChange: state.handleVersionChange,
      toggleOption: state.toggleOption,
      setBatchSizeAndCommit: state.setBatchSizeAndCommit,
      handleCopy: state.handleCopy,
    });
  });

  it("opens and closes shortcut reference dialog", async () => {
    const user = userEvent.setup();
    render(<App />);

    const shortcutButton = screen.getByRole("button", { name: /shortcuts/i });
    await user.click(shortcutButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
