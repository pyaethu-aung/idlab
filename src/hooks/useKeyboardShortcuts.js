import { useEffect } from "react";

const TEXT_INPUT_TYPES = [
  "text",
  "email",
  "search",
  "url",
  "password",
  "number",
  "tel",
];

const TAB_ORDER = ["generator", "validator", "converter", "ulid", "nanoid"];
const TAB_DIGITS = {
  Digit1: 0,
  Digit2: 1,
  Digit3: 2,
  Digit4: 3,
  Digit5: 4,
};

const shouldIgnoreTarget = (target) => {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName?.toUpperCase();
  if (!tagName) return false;
  if (["TEXTAREA", "SELECT"].includes(tagName)) return true;
  if (tagName === "INPUT") {
    const type = target.type?.toLowerCase();
    return TEXT_INPUT_TYPES.includes(type ?? "");
  }
  return false;
};

function useKeyboardShortcuts({
  batchSize,
  formattedUuids,
  isShortcutHelpOpen,
  setShortcutHelpOpen,
  regenerate,
  downloadList,
  handleVersionChange,
  toggleOption,
  toggleValidatorOption,
  setBatchSizeAndCommit,
  handleCopy,
  copyAll,
  cycleExportFormat,
  setActiveTab,
  activeTab,
}) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.repeat) return;
      if (shouldIgnoreTarget(event.target)) return;

      const key = event.key?.toLowerCase?.() ?? "";
      const code = event.code;
      const isEnterKey = key === "enter" || key === "return";
      const metaOrCtrl = event.metaKey || event.ctrlKey;

      if (key === "escape" && isShortcutHelpOpen) {
        event.preventDefault();
        setShortcutHelpOpen(false);
        return;
      }

      if (key === "?" || (code === "Slash" && event.shiftKey)) {
        event.preventDefault();
        setShortcutHelpOpen(true);
        return;
      }

      if (isShortcutHelpOpen) {
        return;
      }

      if (metaOrCtrl && isEnterKey) {
        event.preventDefault();
        regenerate();
        return;
      }

      if (metaOrCtrl && event.altKey && code === "KeyS") {
        event.preventDefault();
        downloadList();
        return;
      }

      if (metaOrCtrl && event.shiftKey && key === "c") {
        if (formattedUuids.length) {
          event.preventDefault();
          handleCopy(formattedUuids[0]);
        }
        return;
      }

      if (event.altKey && !metaOrCtrl) {
        if (code === "ArrowUp") {
          event.preventDefault();
          const increment = event.shiftKey ? 10 : 1;
          setBatchSizeAndCommit(batchSize + increment);
          return;
        }
        if (code === "ArrowDown") {
          event.preventDefault();
          const decrement = event.shiftKey ? 10 : 1;
          setBatchSizeAndCommit(batchSize - decrement);
          return;
        }
        // Alt+Shift tab navigation. Checked before the version digits so the
        // shifted digits route to tabs instead of generator versions.
        if (event.shiftKey && setActiveTab) {
          if (code in TAB_DIGITS) {
            event.preventDefault();
            setActiveTab(TAB_ORDER[TAB_DIGITS[code]]);
            return;
          }
          if (code === "ArrowLeft" || code === "ArrowRight") {
            event.preventDefault();
            const current = TAB_ORDER.indexOf(activeTab);
            const start = current === -1 ? 0 : current;
            const delta = code === "ArrowRight" ? 1 : -1;
            const next = (start + delta + TAB_ORDER.length) % TAB_ORDER.length;
            setActiveTab(TAB_ORDER[next]);
            return;
          }
        }
        if (code === "Digit1") {
          event.preventDefault();
          handleVersionChange("v4");
          return;
        }
        if (code === "Digit2") {
          event.preventDefault();
          handleVersionChange("v1");
          return;
        }
        if (code === "Digit3") {
          event.preventDefault();
          handleVersionChange("v6");
          return;
        }
        if (code === "Digit4") {
          event.preventDefault();
          handleVersionChange("v7");
          return;
        }
        if (code === "Digit5") {
          event.preventDefault();
          handleVersionChange("v3");
          return;
        }
        if (code === "Digit6") {
          event.preventDefault();
          handleVersionChange("v5");
          return;
        }
        if (code === "Digit7") {
          event.preventDefault();
          handleVersionChange("nil");
          return;
        }
        if (code === "Digit8") {
          event.preventDefault();
          handleVersionChange("max");
          return;
        }
        if (code === "KeyU") {
          event.preventDefault();
          toggleOption("uppercase");
          return;
        }
        if (code === "KeyH") {
          event.preventDefault();
          toggleOption("trimHyphens");
          return;
        }
        if (code === "KeyB") {
          event.preventDefault();
          toggleOption("wrapBraces");
          return;
        }
        // Export format / copy-all act on the generator's batch, so keep them
        // scoped to that tab.
        if (code === "KeyC" && activeTab === "generator") {
          event.preventDefault();
          if (event.shiftKey) {
            copyAll?.();
          } else {
            cycleExportFormat?.();
          }
          return;
        }
        if (activeTab === "validator") {
          if (code === "KeyR") {
            event.preventDefault();
            toggleValidatorOption("strictRfc");
            return;
          }
          if (code === "BracketLeft") {
            event.preventDefault();
            toggleValidatorOption("allowBraces");
            return;
          }
          if (code === "Minus") {
            event.preventDefault();
            toggleValidatorOption("allowNoHyphens");
            return;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeTab,
    batchSize,
    copyAll,
    cycleExportFormat,
    downloadList,
    formattedUuids,
    handleCopy,
    handleVersionChange,
    isShortcutHelpOpen,
    regenerate,
    setActiveTab,
    setBatchSizeAndCommit,
    setShortcutHelpOpen,
    toggleOption,
    toggleValidatorOption,
  ]);
}

export default useKeyboardShortcuts;
