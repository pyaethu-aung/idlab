import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useKeyboardShortcuts from "./useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      batchSize: 5,
      formattedUuids: ["uuid-1", "uuid-2"],
      isShortcutHelpOpen: false,
      setShortcutHelpOpen: vi.fn(),
      regenerate: vi.fn(),
      downloadList: vi.fn(),
      handleVersionChange: vi.fn(),
      toggleOption: vi.fn(),
      setBatchSizeAndCommit: vi.fn(),
      handleCopy: vi.fn(),
    };
  });

  const createKeyboardEvent = (overrides = {}) => {
    return new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "a",
      code: "KeyA",
      ...overrides,
    });
  };

  describe("shouldIgnoreTarget logic", () => {
    it("should ignore events from textarea elements", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      const event = createKeyboardEvent({ key: "?" });
      Object.defineProperty(event, "target", { value: textarea });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });

    it("should ignore events from text input elements", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      const event = createKeyboardEvent({ key: "?" });
      Object.defineProperty(event, "target", { value: input });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it("should ignore events from email input elements", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const input = document.createElement("input");
      input.type = "email";
      document.body.appendChild(input);

      const event = createKeyboardEvent({ key: "?" });
      Object.defineProperty(event, "target", { value: input });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it("should ignore events from select elements", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const select = document.createElement("select");
      document.body.appendChild(select);

      const event = createKeyboardEvent({ key: "?" });
      Object.defineProperty(event, "target", { value: select });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).not.toHaveBeenCalled();
      document.body.removeChild(select);
    });

    it("should ignore events from contentEditable elements", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const div = document.createElement("div");
      div.contentEditable = "true";
      document.body.appendChild(div);

      const event = createKeyboardEvent({ key: "?", shiftKey: true, code: "Slash" });
      Object.defineProperty(event, "target", {
        value: div,
        configurable: true,
      });
      // Mock isContentEditable since JSDOM doesn't properly set it
      Object.defineProperty(div, "isContentEditable", {
        value: true,
        configurable: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).not.toHaveBeenCalled();
      document.body.removeChild(div);
    });

    it("should not ignore events from non-input elements", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const div = document.createElement("div");
      document.body.appendChild(div);

      const event = createKeyboardEvent({ key: "?", shiftKey: true, code: "Slash" });
      Object.defineProperty(event, "target", { value: div });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).toHaveBeenCalledWith(true);
      document.body.removeChild(div);
    });
  });

  describe("help dialog shortcuts", () => {
    it("should open help dialog with ?", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "?", shiftKey: true, code: "Slash" });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).toHaveBeenCalledWith(true);
    });

    it("should open help dialog with Shift + /", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "/", shiftKey: true, code: "Slash" });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).toHaveBeenCalledWith(true);
    });

    it("should close help dialog with Escape when help is open", () => {
      mockProps.isShortcutHelpOpen = true;
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "Escape" });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).toHaveBeenCalledWith(false);
    });

    it("should not process other shortcuts when help dialog is open", () => {
      mockProps.isShortcutHelpOpen = true;
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "Enter", metaKey: true });
      window.dispatchEvent(event);

      expect(mockProps.regenerate).not.toHaveBeenCalled();
    });
  });

  describe("regenerate shortcut", () => {
    it("should regenerate with Cmd + Enter", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "Enter", metaKey: true });
      window.dispatchEvent(event);

      expect(mockProps.regenerate).toHaveBeenCalled();
    });

    it("should regenerate with Ctrl + Enter", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "Enter", ctrlKey: true });
      window.dispatchEvent(event);

      expect(mockProps.regenerate).toHaveBeenCalled();
    });

    it("should regenerate with Return key", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "Return", metaKey: true });
      window.dispatchEvent(event);

      expect(mockProps.regenerate).toHaveBeenCalled();
    });
  });

  describe("download shortcut", () => {
    it("should download with Cmd + Alt + S", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "s",
        code: "KeyS",
        metaKey: true,
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.downloadList).toHaveBeenCalled();
    });

    it("should download with Ctrl + Alt + S", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "s",
        code: "KeyS",
        ctrlKey: true,
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.downloadList).toHaveBeenCalled();
    });
  });

  describe("copy shortcut", () => {
    it("should copy first UUID with Cmd + Shift + C when UUIDs exist", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "c",
        metaKey: true,
        shiftKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleCopy).toHaveBeenCalledWith("uuid-1");
    });

    it("should copy first UUID with Ctrl + Shift + C when UUIDs exist", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "c",
        ctrlKey: true,
        shiftKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleCopy).toHaveBeenCalledWith("uuid-1");
    });

    it("should not copy when no UUIDs exist", () => {
      mockProps.formattedUuids = [];
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "c",
        metaKey: true,
        shiftKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleCopy).not.toHaveBeenCalled();
    });
  });

  describe("version selection shortcuts", () => {
    it("should select UUID v4 with Alt + 1", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "1",
        code: "Digit1",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleVersionChange).toHaveBeenCalledWith("v4");
    });

    it("should select UUID v1 with Alt + 2", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "2",
        code: "Digit2",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleVersionChange).toHaveBeenCalledWith("v1");
    });

    it("should select UUID v6 with Alt + 3", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "3",
        code: "Digit3",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleVersionChange).toHaveBeenCalledWith("v6");
    });

    it("should select UUID v7 with Alt + 4", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "4",
        code: "Digit4",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleVersionChange).toHaveBeenCalledWith("v7");
    });

    it("should select max sentinel with Alt + 8", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "8",
        code: "Digit8",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleVersionChange).toHaveBeenCalledWith("max");
    });

    it("should not trigger version change when Cmd/Ctrl is also pressed", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "1",
        code: "Digit1",
        altKey: true,
        metaKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.handleVersionChange).not.toHaveBeenCalled();
    });
  });

  describe("formatting option shortcuts", () => {
    it("should toggle uppercase with Alt + U", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "u",
        code: "KeyU",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.toggleOption).toHaveBeenCalledWith("uppercase");
    });

    it("should toggle trim hyphens with Alt + H", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "h",
        code: "KeyH",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.toggleOption).toHaveBeenCalledWith("trimHyphens");
    });

    it("should toggle wrap braces with Alt + B", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "b",
        code: "KeyB",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.toggleOption).toHaveBeenCalledWith("wrapBraces");
    });

    it("should not toggle options when Cmd/Ctrl is also pressed", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "u",
        code: "KeyU",
        altKey: true,
        metaKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.toggleOption).not.toHaveBeenCalled();
    });
  });

  describe("batch size adjustment shortcuts", () => {
    it("should increment batch size by 1 with Alt + ArrowUp", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "ArrowUp",
        code: "ArrowUp",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.setBatchSizeAndCommit).toHaveBeenCalledWith(6);
    });

    it("should decrement batch size by 1 with Alt + ArrowDown", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "ArrowDown",
        code: "ArrowDown",
        altKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.setBatchSizeAndCommit).toHaveBeenCalledWith(4);
    });

    it("should increment batch size by 10 with Alt + Shift + ArrowUp", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "ArrowUp",
        code: "ArrowUp",
        altKey: true,
        shiftKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.setBatchSizeAndCommit).toHaveBeenCalledWith(15);
    });

    it("should decrement batch size by 10 with Alt + Shift + ArrowDown", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "ArrowDown",
        code: "ArrowDown",
        altKey: true,
        shiftKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.setBatchSizeAndCommit).toHaveBeenCalledWith(-5);
    });

    it("should not adjust batch size when Cmd/Ctrl is also pressed", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({
        key: "ArrowUp",
        code: "ArrowUp",
        altKey: true,
        metaKey: true,
      });
      window.dispatchEvent(event);

      expect(mockProps.setBatchSizeAndCommit).not.toHaveBeenCalled();
    });
  });

  describe("event handling edge cases", () => {
    it("should ignore repeated key events", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "?", shiftKey: true, code: "Slash" });
      Object.defineProperty(event, "repeat", { value: true });
      window.dispatchEvent(event);

      expect(mockProps.setShortcutHelpOpen).not.toHaveBeenCalled();
    });

    it("should prevent default behavior for recognized shortcuts", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "Enter", metaKey: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should cleanup event listener on unmount", () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockProps));
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");

      unmount();

      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      addSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it("should handle case insensitive key comparisons", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = createKeyboardEvent({ key: "C", metaKey: true, shiftKey: true });
      window.dispatchEvent(event);

      expect(mockProps.handleCopy).toHaveBeenCalledWith("uuid-1");
    });

    it("should handle missing key property gracefully", () => {
      renderHook(() => useKeyboardShortcuts(mockProps));
      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        code: "KeyA",
      });
      Object.defineProperty(event, "key", { value: undefined });

      expect(() => window.dispatchEvent(event)).not.toThrow();
    });
  });

  describe("dependency updates", () => {
    it("should update event handler when props change", () => {
      const { rerender } = renderHook(
        ({ props }) => useKeyboardShortcuts(props),
        { initialProps: { props: mockProps } }
      );

      const event = createKeyboardEvent({ key: "ArrowUp", code: "ArrowUp", altKey: true });
      window.dispatchEvent(event);
      expect(mockProps.setBatchSizeAndCommit).toHaveBeenCalledWith(6);

      // Update batchSize prop
      const updatedProps = { ...mockProps, batchSize: 10 };
      rerender({ props: updatedProps });

      mockProps.setBatchSizeAndCommit.mockClear();
      window.dispatchEvent(event);
      expect(mockProps.setBatchSizeAndCommit).toHaveBeenCalledWith(11);
    });
  });
});
