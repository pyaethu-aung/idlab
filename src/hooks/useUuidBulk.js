import { useState, useMemo, useCallback } from "react";
import { parseUuidList } from "../utils/uuidBulk";

const DEFAULT_OPTIONS = { strictRfc: false, allowBraces: true, allowNoHyphens: false };

// A mixed sample: valid v4/v7/v1, a nil sentinel, plus two deliberately broken
// lines so the table demonstrates both states on first load.
const SAMPLE = [
  "550e8400-e29b-41d4-a716-446655440000",
  "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "00000000-0000-0000-0000-000000000000",
  "not-a-uuid",
  "550e8400-e29b-41d4-a716",
].join("\n");

function useUuidBulk() {
  const [rawInput, setRawInput] = useState("");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(
    () => (rawInput.trim() ? parseUuidList(rawInput, options) : null),
    [rawInput, options]
  );

  const hasInput = Boolean(rawInput.trim());
  const validCount = parsed?.summary.valid ?? 0;

  const toggleOption = useCallback((key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearInput = useCallback(() => setRawInput(""), []);

  const loadSample = useCallback(() => setRawInput(SAMPLE), []);

  const copyValid = useCallback(() => {
    if (!parsed || !navigator.clipboard?.writeText) return;
    const valids = parsed.rows
      .filter((row) => row.result.valid)
      .map((row) => row.result.raw);
    if (!valids.length) return;
    navigator.clipboard.writeText(valids.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [parsed]);

  return {
    rawInput,
    setRawInput,
    options,
    toggleOption,
    parsed,
    hasInput,
    validCount,
    clearInput,
    loadSample,
    copyValid,
    copied,
  };
}

export default useUuidBulk;
