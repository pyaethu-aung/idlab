import { useCallback, useState } from "react";

// The language the ⌥S keyboard accelerator copies. js is the default mental
// model for "how do I mint this" and the reference implementation this app's
// own generator wraps, so it is the honest single default among the rows.
const DEFAULT_LANG = "js";

const FLASH_MS = 1500;

// Owns the "Copy as code" panel's view state so it is reachable from both the
// panel buttons and the keyboard map (⌥F flip, ⌥S copy). Pure view state — no
// generation logic; caller provides the snippet rows.
//
// Defaults to `full`: the feature exists to hand over a complete, runnable
// program, so the safe (dependency-complete) form is the default and the
// compact one-liner is the opt-in. Flip the initial value to `false` to make
// inline the default again.
//
// `rows` may be null (nil/max sentinels, unknown version) — the panel hides.
// For NanoID, `rows` changes on every size/alphabet change; the hook re-derives
// copyDefault on each new reference without resetting the inline/full toggle.
function useCodeSnippets(rows) {
  const [full, setFull] = useState(true);
  const [copiedLang, setCopiedLang] = useState(null);
  const [clipboardError, setClipboardError] = useState(false);

  const copy = useCallback((lang, text) => {
    if (!navigator.clipboard?.writeText) {
      setClipboardError(true);
      setTimeout(() => setClipboardError(false), FLASH_MS);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLang(lang);
      setTimeout(() => setCopiedLang(null), FLASH_MS);
    });
  }, []);

  const toggleFull = useCallback(() => setFull((prev) => !prev), []);

  // ⌥S accelerator: copy the default language's snippet for the current
  // version, honoring the inline/full toggle. No-op when the version has no
  // snippets (nil/max), matching the hidden panel.
  const copyDefault = useCallback(() => {
    if (!rows) return;
    const row = rows.find((r) => r.lang === DEFAULT_LANG) ?? rows[0];
    copy(row.lang, full ? row.full : row.code);
  }, [rows, full, copy]);

  return { rows, full, toggleFull, copiedLang, clipboardError, copy, copyDefault };
}

export default useCodeSnippets;
