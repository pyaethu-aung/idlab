import { useState, useMemo, useCallback } from "react";
import { generateKsuid, decodeKsuid } from "../utils/ksuid";
import useCopyFlash from "./useCopyFlash";

// A fixed sample so the panel has something to inspect on first load and via
// the sample pill (mirrors ULID_SAMPLES in useUlid.js).
export const KSUID_SAMPLES = [
  { id: "ksuid", label: "ksuid", value: "2YBXZIdZpuEB0Z0gxchzBCwPdBh" },
];

function useKsuid() {
  const [rawInput, setRawInput] = useState(() => generateKsuid());
  const [activeSample, setActiveSample] = useState(null);
  const { copiedKey, copyValue } = useCopyFlash();

  const result = useMemo(
    () => (rawInput.trim() ? decodeKsuid(rawInput) : null),
    [rawInput]
  );

  const hasInput = Boolean(rawInput.trim());

  const handleSetRawInput = useCallback((value) => {
    setRawInput(value);
    setActiveSample((prev) => {
      const sample = KSUID_SAMPLES.find((s) => s.id === prev);
      return sample && sample.value === value ? prev : null;
    });
  }, []);

  const generate = useCallback(() => {
    setRawInput(generateKsuid());
    setActiveSample(null);
  }, []);

  const clearInput = useCallback(() => {
    setRawInput("");
    setActiveSample(null);
  }, []);

  const loadSample = useCallback((id) => {
    const sample = KSUID_SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setRawInput(sample.value);
    setActiveSample(id);
  }, []);

  return {
    rawInput,
    setRawInput: handleSetRawInput,
    result,
    hasInput,
    generate,
    clearInput,
    loadSample,
    activeSample,
    copiedKey,
    copyValue,
  };
}

export default useKsuid;
