import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { parseUuid } from "../utils/uuidDecoder";

const SAMPLES = {
  nil: "00000000-0000-0000-0000-000000000000",
  v1:  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  v3:  "a3bb189e-8bf9-3888-9912-ace4e6543002",
  v4:  "550e8400-e29b-41d4-a716-446655440000",
  v5:  "886313e1-3b8a-5372-9b90-0c9aee199e5d",
  v7:  "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d",
};

const DEFAULT_OPTIONS = { strictRfc: false, allowBraces: true, allowNoHyphens: false };

function useUuidValidator() {
  const [rawInput, setRawInput] = useState(SAMPLES.v7);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const [activeSample, setActiveSample] = useState("v7");
  const [checkCount, setCheckCount] = useState(0);
  const prevValidRef = useRef(false);

  const result = useMemo(() => {
    if (!rawInput) return null;
    return parseUuid(rawInput, options);
  }, [rawInput, options]);

  // Increment check count whenever a new valid result is produced
  useEffect(() => {
    if (result?.valid && !prevValidRef.current) {
      setCheckCount((c) => c + 1); // eslint-disable-line react-hooks/set-state-in-effect
    }
    prevValidRef.current = result?.valid ?? false;
  }, [result]);

  const toggleOption = useCallback((key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const loadSample = useCallback((version) => {
    const uuid = SAMPLES[version];
    if (!uuid) return;
    setRawInput(uuid);
    setActiveSample(version);
  }, []);

  const handleCopy = useCallback(() => {
    const uuid = result?.valid ? result.raw : rawInput;
    if (!uuid) return;
    navigator.clipboard.writeText(uuid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [result, rawInput]);

  const recheck = useCallback(() => {
    // Force revalidation by toggling input (noop functionally — same result, but
    // calling setRawInput with same value won't re-run useMemo due to same ref,
    // so we clear and restore to force the memoized computation to re-run)
    setRawInput((v) => v);
  }, []);

  const handleSetRawInput = useCallback((value) => {
    setRawInput(value);
    // Clear active sample if user manually edits
    setActiveSample((prev) => {
      if (prev && SAMPLES[prev] !== value) return null;
      return prev;
    });
  }, []);

  return {
    rawInput,
    setRawInput: handleSetRawInput,
    result,
    options,
    toggleOption,
    loadSample,
    activeSample,
    handleCopy,
    copied,
    recheck,
    checkCount,
  };
}

export default useUuidValidator;
