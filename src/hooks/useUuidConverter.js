import { useState, useMemo, useCallback } from "react";
import { convertUuid } from "../utils/uuidConvert";

function useUuidConverter() {
  const [rawInput, setRawInput] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  const conversions = useMemo(
    () => (rawInput.trim() ? convertUuid(rawInput) : null),
    [rawInput]
  );

  const hasInput = Boolean(rawInput.trim());

  const copyRow = useCallback((key, value) => {
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }, []);

  const clearInput = useCallback(() => setRawInput(""), []);

  return {
    rawInput,
    setRawInput,
    conversions,
    hasInput,
    copiedKey,
    copyRow,
    clearInput,
  };
}

export default useUuidConverter;
