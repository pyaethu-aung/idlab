import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { parseUuidList } from "../utils/uuidBulk";
import { convertTimeUuid, uuidGenerators } from "../utils/uuid";

const SAMPLES = {
  nil: "00000000-0000-0000-0000-000000000000",
  v1:  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  v3:  "a3bb189e-8bf9-3888-9912-ace4e6543002",
  v4:  "550e8400-e29b-41d4-a716-446655440000",
  v5:  "886313e1-3b8a-5372-9b90-0c9aee199e5d",
  v6:  "1d19dad6-ba7b-6810-80b4-00c04fd430c8",
  v7:  "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d",
};

// A mixed sample list: valid v4/v7/v1, the nil sentinel, plus two deliberately
// broken lines so the table demonstrates both states on first load.
const SAMPLE_LIST = [
  "550e8400-e29b-41d4-a716-446655440000",
  "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "00000000-0000-0000-0000-000000000000",
  "not-a-uuid",
  "550e8400-e29b-41d4-a716",
].join("\n");

const DEFAULT_OPTIONS = { strictRfc: false, allowBraces: true, allowNoHyphens: false };

// The validator handles one UUID or many: the input is always parsed as a list,
// and a single UUID is just "a list of one". Each row carries a full parseUuid
// result, so an expanded row reuses the same anatomy + conversion the single
// inspector once owned. expandState: null = derive (a lone row auto-expands),
// "none" = explicitly collapsed, a number = that line is expanded.
function useUuidValidator() {
  const [rawInput, setRawInputState] = useState(() => uuidGenerators.v7());
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [activeSample, setActiveSample] = useState(null);
  const [checkCount, setCheckCount] = useState(0);
  const [expandState, setExpandState] = useState(null);
  const [copiedLine, setCopiedLine] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [conversionCopied, setConversionCopied] = useState(false);
  const prevValidRef = useRef(0);

  const parsed = useMemo(
    () => (rawInput.trim() ? parseUuidList(rawInput, options) : null),
    [rawInput, options]
  );

  const rows = useMemo(() => parsed?.rows ?? [], [parsed]);
  const summary = parsed?.summary ?? null;
  const validCount = summary?.valid ?? 0;

  // One row inspects immediately (auto-expanded); many rows start collapsed so
  // the table reads as triage first. A stale explicit line collapses cleanly.
  const expandedLine = useMemo(() => {
    if (expandState === "none") return null;
    if (typeof expandState === "number") {
      return rows.some((r) => r.line === expandState) ? expandState : null;
    }
    return rows.length === 1 ? rows[0].line : null;
  }, [expandState, rows]);

  const expandedResult = useMemo(
    () => rows.find((r) => r.line === expandedLine)?.result ?? null,
    [rows, expandedLine]
  );

  // v1 and v6 are reorderings of one another, so the expanded row offers its
  // counterpart when it is one of those two. Other versions yield null.
  const conversion = useMemo(() => {
    const r = expandedResult;
    if (!r?.valid || (r.version !== 1 && r.version !== 6)) return null;
    const value = convertTimeUuid(r.raw, r.version);
    if (!value) return null;
    return { from: r.version, to: r.version === 1 ? 6 : 1, value };
  }, [expandedResult]);

  // Count a "check" each time the valid set grows from empty, so the status bar
  // tally tracks deliberate validations rather than every keystroke.
  useEffect(() => {
    if (validCount > 0 && prevValidRef.current === 0) {
      setCheckCount((c) => c + 1);
    }
    prevValidRef.current = validCount;
  }, [validCount]);

  // Mirror the effective expanded line into a ref so toggleRow can compare
  // against it without re-deriving (the lone-row case has no explicit state).
  const expandedLineRef = useRef(null);
  useEffect(() => {
    expandedLineRef.current = expandedLine;
  }, [expandedLine]);

  const setRawInput = useCallback((value) => {
    setRawInputState(value);
    setExpandState(null);
    setActiveSample((prev) => (prev && SAMPLES[prev] !== value.trim() ? null : prev));
  }, []);

  const toggleOption = useCallback((key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleRow = useCallback((line) => {
    setExpandState(expandedLineRef.current === line ? "none" : line);
  }, []);

  const clearInput = useCallback(() => {
    setRawInputState("");
    setExpandState(null);
    setActiveSample(null);
  }, []);

  const loadSample = useCallback((version) => {
    const uuid = SAMPLES[version];
    if (!uuid) return;
    setRawInputState(uuid);
    setExpandState(null);
    setActiveSample(version);
  }, []);

  const loadSampleList = useCallback(() => {
    setRawInputState(SAMPLE_LIST);
    setExpandState(null);
    setActiveSample(null);
  }, []);

  const copyOne = useCallback((line, raw) => {
    if (!raw || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(raw).then(() => {
      setCopiedLine(line);
      setTimeout(() => setCopiedLine(null), 1500);
    });
  }, []);

  const copyValid = useCallback(() => {
    if (!parsed || !navigator.clipboard?.writeText) return;
    const valids = parsed.rows
      .filter((row) => row.result.valid)
      .map((row) => row.result.raw);
    if (!valids.length) return;
    navigator.clipboard.writeText(valids.join("\n")).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    });
  }, [parsed]);

  const copyConversion = useCallback(() => {
    if (!conversion?.value || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(conversion.value).then(() => {
      setConversionCopied(true);
      setTimeout(() => setConversionCopied(false), 1500);
    });
  }, [conversion]);

  return {
    rawInput,
    setRawInput,
    options,
    toggleOption,
    parsed,
    summary,
    validCount,
    expandedLine,
    toggleRow,
    expandedResult,
    conversion,
    conversionCopied,
    copyConversion,
    copyValid,
    copiedAll,
    copyOne,
    copiedLine,
    clearInput,
    loadSample,
    loadSampleList,
    activeSample,
    checkCount,
  };
}

export default useUuidValidator;
