import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildBatch,
  defaultNamespace,
  defaultOptions,
  formatUuid,
  isConstantVersion,
  isTimeBasedVersion,
  makeNameBasedGenerator,
  makeTimestampGenerator,
  parseDateTimeLocal,
  toDateTimeLocal,
  uuidGenerators,
  uuidNameBased,
} from "../utils/uuid";
import { EXPORT_FORMATS, exportUuids } from "../utils/uuidExport";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const initialBatchSize = 8;

function useUuidGenerator() {
  const [batchSize, setBatchSize] = useState(initialBatchSize);
  const [selectedVersion, setSelectedVersion] = useState("v4");
  const [namespace, setNamespace] = useState(defaultNamespace);
  const [name, setName] = useState("");
  const [timestampMode, setTimestampMode] = useState("now");
  const [pinnedTime, setPinnedTime] = useState("");
  const [options, setOptions] = useState(defaultOptions);
  const [rawUuids, setRawUuids] = useState(() => buildBatch(initialBatchSize));
  const [copiedUuid, setCopiedUuid] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [exportFormat, setExportFormat] = useState("txt");
  const feedbackTimer = useRef(null);
  const refreshTimer = useRef(null);
  const downloadTimer = useRef(null);

  const clipboardSupported =
    typeof navigator !== "undefined" && Boolean(navigator.clipboard?.writeText);

  const formattedUuids = useMemo(
    () => rawUuids.map((value) => formatUuid(value, options)),
    [rawUuids, options]
  );

  const isNameBased = selectedVersion === "v3" || selectedVersion === "v5";
  const isConstant = isConstantVersion(selectedVersion);
  const isTimeBased = isTimeBasedVersion(selectedVersion);
  // Both name-based and sentinel versions yield one deterministic value, so
  // batch sizing and regeneration are locked off for either.
  const isFixed = isNameBased || isConstant;

  // Resolve the generator for a version, honouring name inputs and a pinned
  // timestamp. Overrides let handlers pass a not-yet-committed mode or time so
  // the visible batch refreshes synchronously with the state change.
  const resolveGenerator = useCallback(
    (version, overrides = {}) => {
      const mode = overrides.timestampMode ?? timestampMode;
      const time = overrides.pinnedTime ?? pinnedTime;
      if (version === "v3" || version === "v5") {
        return makeNameBasedGenerator(uuidNameBased[version], namespace, name);
      }
      if (isTimeBasedVersion(version) && mode === "pinned") {
        const stamped = makeTimestampGenerator(version, parseDateTimeLocal(time));
        // Falls through to live generation when the pinned time is blank or
        // unparseable, so the preview never goes empty.
        if (stamped) {
          return stamped;
        }
      }
      return uuidGenerators[version] ?? uuidGenerators.v4;
    },
    [namespace, name, timestampMode, pinnedTime]
  );

  const generatorForVersion = useMemo(
    () => resolveGenerator(selectedVersion),
    [resolveGenerator, selectedVersion]
  );

  const pinnedMsecs = useMemo(
    () => parseDateTimeLocal(pinnedTime),
    [pinnedTime]
  );

  const visibleBatchSize = isFixed ? 1 : Math.min(batchSize, 20);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
      if (downloadTimer.current) {
        clearTimeout(downloadTimer.current);
      }
    };
  }, []);

  const stageFeedback = useCallback((message) => {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }

    setFeedback(message);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 2400);
  }, []);

  const syncVisibleBatch = useCallback(
    (count = batchSize, generator = generatorForVersion) => {
      const limited = clamp(count, 1, 20);
      setRawUuids(buildBatch(limited, generator));
    },
    [batchSize, generatorForVersion]
  );

  const regenerate = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
    setIsRefreshing(true);
    syncVisibleBatch(isFixed ? 1 : batchSize);
    refreshTimer.current = setTimeout(() => setIsRefreshing(false), 400);
  }, [syncVisibleBatch, isFixed, batchSize]);

  const handleVersionChange = useCallback(
    (versionId) => {
      setSelectedVersion(versionId);
      const nextIsNameBased = versionId === "v3" || versionId === "v5";
      const nextIsFixed = nextIsNameBased || isConstantVersion(versionId);
      syncVisibleBatch(nextIsFixed ? 1 : batchSize, resolveGenerator(versionId));
      stageFeedback(`Switched to UUID ${versionId.toUpperCase()}`);
    },
    [batchSize, resolveGenerator, syncVisibleBatch, stageFeedback]
  );

  const handleTimestampModeChange = useCallback(
    (mode) => {
      setTimestampMode(mode);
      // Seed an empty/invalid pin with the current local moment so the date
      // and time fields default to "now" instead of blank placeholders.
      let nextTime = pinnedTime;
      if (mode === "pinned" && parseDateTimeLocal(pinnedTime) === null) {
        nextTime = toDateTimeLocal();
        setPinnedTime(nextTime);
      }
      syncVisibleBatch(
        batchSize,
        resolveGenerator(selectedVersion, {
          timestampMode: mode,
          pinnedTime: nextTime,
        })
      );
    },
    [batchSize, selectedVersion, pinnedTime, resolveGenerator, syncVisibleBatch]
  );

  const handleTimestampChange = useCallback(
    (value) => {
      setPinnedTime(value);
      syncVisibleBatch(
        batchSize,
        resolveGenerator(selectedVersion, { pinnedTime: value })
      );
    },
    [batchSize, selectedVersion, resolveGenerator, syncVisibleBatch]
  );

  const handleNamespaceChange = useCallback(
    (nextNamespace) => {
      setNamespace(nextNamespace);
      syncVisibleBatch(1, makeNameBasedGenerator(uuidNameBased[selectedVersion], nextNamespace, name));
    },
    [name, selectedVersion, syncVisibleBatch]
  );

  const handleNameChange = useCallback(
    (nextName) => {
      setName(nextName);
      syncVisibleBatch(1, makeNameBasedGenerator(uuidNameBased[selectedVersion], namespace, nextName));
    },
    [namespace, selectedVersion, syncVisibleBatch]
  );

  const handleCopy = useCallback(
    async (value) => {
      if (!clipboardSupported) {
        stageFeedback("Clipboard not available in this browser");
        return;
      }

      try {
        await navigator.clipboard.writeText(value);
        setCopiedUuid(value);
        stageFeedback("Copied to clipboard");
        setTimeout(() => setCopiedUuid(""), 1200);
      } catch (error) {
        console.error("Unable to copy UUID", error);
        stageFeedback("Copy failed — please try again");
      }
    },
    [clipboardSupported, stageFeedback]
  );

  const downloadList = useCallback(() => {
    if (isDownloading) {
      return;
    }

    if (downloadTimer.current) {
      clearTimeout(downloadTimer.current);
    }

    setIsDownloading(true);

    try {
      const effectiveCount = clamp(batchSize, 1, 200);
      const extendedBatch = buildBatch(effectiveCount, generatorForVersion);
      const formattedDownload = extendedBatch.map((value) =>
        formatUuid(value, options)
      );

      const timestamp = new Date()
        .toISOString()
        .replaceAll(":", "-")
        .replaceAll(".", "-");
      const { content, mimeType, filename } = exportUuids(
        formattedDownload,
        exportFormat,
        timestamp
      );
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      stageFeedback(
        `Saved ${formattedDownload.length} UUIDs as a .${exportFormat} file`
      );
    } catch (error) {
      console.error("Unable to download UUID list", error);
      stageFeedback("Download failed — please try again");
    } finally {
      downloadTimer.current = setTimeout(() => setIsDownloading(false), 400);
    }
  }, [batchSize, exportFormat, generatorForVersion, isDownloading, options, stageFeedback]);

  const copyAll = useCallback(async () => {
    if (!clipboardSupported) {
      stageFeedback("Clipboard not available in this browser");
      return;
    }
    try {
      await navigator.clipboard.writeText(formattedUuids.join("\n"));
      stageFeedback(`Copied ${formattedUuids.length} UUIDs`);
    } catch {
      stageFeedback("Copy failed — please try again");
    }
  }, [clipboardSupported, formattedUuids, stageFeedback]);

  const cycleExportFormat = useCallback(() => {
    setExportFormat((prev) => {
      const index = EXPORT_FORMATS.indexOf(prev);
      const next = EXPORT_FORMATS[(index + 1) % EXPORT_FORMATS.length];
      stageFeedback(`Export format: .${next}`);
      return next;
    });
  }, [stageFeedback]);

  const toggleOption = useCallback((key) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const commitBatchSize = useCallback((explicitCount) => {
    syncVisibleBatch(isFixed ? 1 : (explicitCount ?? batchSize));
  }, [syncVisibleBatch, isFixed, batchSize]);

  const setBatchSizeAndCommit = useCallback(
    (nextCount) => {
      const limited = clamp(nextCount, 1, 200);
      setBatchSize(limited);
      syncVisibleBatch(isFixed ? 1 : limited);
    },
    [syncVisibleBatch, isFixed]
  );

  return {
    batchSize,
    setBatchSize,
    setBatchSizeAndCommit,
    visibleBatchSize,
    selectedVersion,
    isNameBased,
    isFixed,
    isTimeBased,
    namespace,
    name,
    timestampMode,
    pinnedTime,
    pinnedMsecs,
    options,
    exportFormat,
    setExportFormat,
    cycleExportFormat,
    formattedUuids,
    copiedUuid,
    feedback,
    clipboardSupported,
    isRefreshing,
    isDownloading,
    regenerate,
    handleCopy,
    copyAll,
    handleVersionChange,
    handleNamespaceChange,
    handleNameChange,
    handleTimestampModeChange,
    handleTimestampChange,
    toggleOption,
    downloadList,
    commitBatchSize,
  };
}

export default useUuidGenerator;
