import { useState, useCallback } from "react";

// Copies a value to the clipboard and flashes `copiedKey` back to null after
// `timeout`ms, so callers can show a per-row/per-value "copied" state.
function useCopyFlash(timeout = 1500) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyValue = useCallback(
    (key, value) => {
      if (!value || !navigator.clipboard?.writeText) return;
      navigator.clipboard.writeText(value).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), timeout);
      });
    },
    [timeout]
  );

  return { copiedKey, copyValue };
}

export default useCopyFlash;
