import { useState, useMemo, useCallback } from "react";
import { convertUuid } from "../utils/uuidConvert";
import useCopyFlash from "./useCopyFlash";

function useUuidConverter() {
  const [rawInput, setRawInput] = useState("");
  const { copiedKey, copyValue: copyRow } = useCopyFlash();

  const conversions = useMemo(
    () => (rawInput.trim() ? convertUuid(rawInput) : null),
    [rawInput]
  );

  const hasInput = Boolean(rawInput.trim());

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
