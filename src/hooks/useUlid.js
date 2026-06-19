import { useState, useMemo, useCallback } from "react";
import { generateUlid, inspectIdentifier } from "../utils/ulid";

// Fixed samples that exercise both input paths: a canonical ULID (the spec
// example) and a UUIDv7 to demonstrate the ULID <-> UUIDv7 conversion.
export const ULID_SAMPLES = [
  { id: "ulid", label: "ulid", value: "01ARZ3NDEKTSV4RRFFQ69G5FAV" },
  { id: "uuidv7", label: "uuidv7", value: "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d" },
];

function useUlid() {
  const [rawInput, setRawInput] = useState(() => generateUlid());
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeSample, setActiveSample] = useState(null);

  const result = useMemo(
    () => (rawInput.trim() ? inspectIdentifier(rawInput) : null),
    [rawInput]
  );

  const hasInput = Boolean(rawInput.trim());

  const handleSetRawInput = useCallback((value) => {
    setRawInput(value);
    setActiveSample((prev) => {
      const sample = ULID_SAMPLES.find((s) => s.id === prev);
      return sample && sample.value === value ? prev : null;
    });
  }, []);

  const generate = useCallback(() => {
    setRawInput(generateUlid());
    setActiveSample(null);
  }, []);

  const clearInput = useCallback(() => {
    setRawInput("");
    setActiveSample(null);
  }, []);

  const loadSample = useCallback((id) => {
    const sample = ULID_SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setRawInput(sample.value);
    setActiveSample(id);
  }, []);

  const copyValue = useCallback((key, value) => {
    if (!value || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
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

export default useUlid;
