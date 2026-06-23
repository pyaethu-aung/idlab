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

// Generator version order behind ⌥1…8.
const VERSION_DIGITS = {
  Digit1: "v4",
  Digit2: "v1",
  Digit3: "v6",
  Digit4: "v7",
  Digit5: "v3",
  Digit6: "v5",
  Digit7: "nil",
  Digit8: "max",
};

// Generator format toggles behind ⌥U / ⌥H / ⌥B.
const FORMAT_KEYS = {
  KeyU: "uppercase",
  KeyH: "trimHyphens",
  KeyB: "wrapBraces",
};

// Validator accept-option toggles behind ⌥R / ⌥[ / ⌥-.
const VALIDATOR_KEYS = {
  KeyR: "strictRfc",
  BracketLeft: "allowBraces",
  Minus: "allowNoHyphens",
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
  downloadList,
  handleVersionChange,
  toggleOption,
  toggleValidatorOption,
  setBatchSizeAndCommit,
  handleCopy,
  cycleExportFormat,
  setActiveTab,
  activeTab,
  // Per-tab dispatch for the shared verbs: { [tab]: { generate, copyAll, clear } }.
  // A missing entry means the verb is a no-op on that tab.
  tabActions = {},
  // Generator "Copy as code" panel accelerators (⌥F flip, ⌥S copy default lang).
  toggleSnippetFull,
  copySnippet,
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
      const actions = tabActions[activeTab] ?? {};

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

      // ⌘/Ctrl + Enter → generate / mint on tabs that produce output.
      if (metaOrCtrl && isEnterKey) {
        if (actions.generate) {
          event.preventDefault();
          actions.generate();
        }
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
        // ── Global ⌥ keys (work on every tab) ──────────────────────────────
        // Alt+Shift tab navigation. Checked before anything tab-scoped so the
        // shifted digits route to tabs, not generator versions.
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
        // ⌥⌫ → clear the input on tabs that have one.
        if (code === "Backspace") {
          if (actions.clear) {
            event.preventDefault();
            actions.clear();
          }
          return;
        }
        // ⌥⇧C → copy all output on tabs that have a batch.
        if (code === "KeyC" && event.shiftKey) {
          if (actions.copyAll) {
            event.preventDefault();
            actions.copyAll();
          }
          return;
        }

        // ── Generator-only ⌥ keys ──────────────────────────────────────────
        // Scoped so they never mutate generator state from another tab.
        if (activeTab === "generator") {
          if (code === "ArrowUp") {
            event.preventDefault();
            setBatchSizeAndCommit(batchSize + (event.shiftKey ? 10 : 1));
            return;
          }
          if (code === "ArrowDown") {
            event.preventDefault();
            setBatchSizeAndCommit(batchSize - (event.shiftKey ? 10 : 1));
            return;
          }
          const version = VERSION_DIGITS[code];
          if (version) {
            event.preventDefault();
            handleVersionChange(version);
            return;
          }
          const option = FORMAT_KEYS[code];
          if (option) {
            event.preventDefault();
            toggleOption(option);
            return;
          }
          if (code === "KeyC") {
            event.preventDefault();
            cycleExportFormat?.();
            return;
          }
          // ⌥F → flip the snippet panel between inline and full.
          if (code === "KeyF") {
            if (toggleSnippetFull) {
              event.preventDefault();
              toggleSnippetFull();
            }
            return;
          }
          // ⌥S → copy the default-language snippet for the current version.
          if (code === "KeyS") {
            if (copySnippet) {
              event.preventDefault();
              copySnippet();
            }
            return;
          }
        }

        // ── Validator-only ⌥ keys ──────────────────────────────────────────
        if (activeTab === "validator") {
          const validatorOption = VALIDATOR_KEYS[code];
          if (validatorOption) {
            event.preventDefault();
            toggleValidatorOption(validatorOption);
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
    cycleExportFormat,
    downloadList,
    formattedUuids,
    handleCopy,
    handleVersionChange,
    isShortcutHelpOpen,
    setActiveTab,
    setBatchSizeAndCommit,
    setShortcutHelpOpen,
    tabActions,
    toggleOption,
    toggleValidatorOption,
    toggleSnippetFull,
    copySnippet,
  ]);
}

export default useKeyboardShortcuts;
