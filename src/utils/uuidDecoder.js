import { insertHyphens } from "./uuid";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const UUID_COMPACT_REGEX = /^[0-9a-f]{32}$/i;

// 100ns ticks from Oct 15, 1582 to Jan 1, 1970
const GREGORIAN_OFFSET = 122192928000000000n;

export function normalizeInput(raw) {
  if (typeof raw !== "string") return "";
  let s = raw.trim();
  if (s.startsWith("{") && s.endsWith("}")) s = s.slice(1, -1);
  return s;
}

export function extractFields(uuid) {
  const hex = uuid.replace(/-/g, "").toLowerCase();
  return {
    timeLow: hex.slice(0, 8),
    timeMid: hex.slice(8, 12),
    timeHighAndVersion: hex.slice(12, 16),
    clockSeqAndReserved: hex.slice(16, 20),
    node: hex.slice(20, 32),
  };
}

export function detectVariant(hex) {
  const v = parseInt(hex[16], 16);
  if (v <= 7) return "NCS";
  if (v <= 11) return "RFC 4122";
  if (v <= 13) return "Microsoft";
  return "Reserved";
}

export function buildVariantBits(hex) {
  const v = parseInt(hex[16], 16);
  if (v <= 7) return "NCS · 0xx";
  if (v <= 11) return "RFC 4122 · 10x · b00…b01";
  if (v <= 13) return "Microsoft · 110";
  return "Reserved · 111";
}

export function computeProperties(raw, normalized, version, variant) {
  const hex = normalized.replace(/-/g, "").toLowerCase();
  const isLowercase = normalized === normalized.toLowerCase();
  const hasHyphens = UUID_REGEX.test(normalized);
  const hasBraces = raw.trim().startsWith("{") && raw.trim().endsWith("}");
  const isNil = /^0+$/.test(hex);
  const charCount = hasHyphens ? 36 : 32;

  let format = "canonical";
  if (hasBraces) format = "braces";
  else if (!hasHyphens) format = "no-hyphens";

  const variantBits = buildVariantBits(hex);

  return {
    isLowercase,
    hasHyphens,
    hasBraces,
    isNil,
    format,
    charCount,
    variant,
    variantBits,
  };
}

function diagnoseFormat(stripped) {
  const hyphenless = stripped.replace(/-/g, "").toLowerCase();
  const nonHexMatch = hyphenless.match(/[^0-9a-f]/);
  if (nonHexMatch) {
    const pos = hyphenless.indexOf(nonHexMatch[0]) + 1;
    return `invalid character '${nonHexMatch[0]}' at position ${pos}`;
  }
  if (hyphenless.length !== 32) {
    return `expected 32 hex digits — got ${hyphenless.length}`;
  }
  return "expected groups 8-4-4-4-12";
}

export function parseUuid(raw, options = {}) {
  const { strictRfc = false, allowBraces = true, allowNoHyphens = false } = options;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  const hasBraces = trimmed.startsWith("{") && trimmed.endsWith("}");
  const stripped = hasBraces ? trimmed.slice(1, -1) : trimmed;

  if (!stripped) return { valid: false, raw: stripped, reason: "paste a UUID to validate" };

  // Determine input format and normalize to canonical
  let normalized;
  if (UUID_REGEX.test(stripped)) {
    normalized = stripped;
  } else if (UUID_COMPACT_REGEX.test(stripped)) {
    if (!allowNoHyphens) return { valid: false, raw: stripped, reason: "compact form — enable 'allow no-hyphens'" };
    normalized = insertHyphens(stripped.toLowerCase());
  } else {
    return { valid: false, raw: stripped, reason: diagnoseFormat(stripped) };
  }

  if (hasBraces && !allowBraces) return { valid: false, raw: stripped, reason: "braces form — enable 'allow braces { }'" };

  const lower = normalized.toLowerCase();
  const hex = lower.replace(/-/g, "");
  const version = parseInt(hex[12], 16);
  const variant = detectVariant(hex);

  if (strictRfc && variant !== "RFC 4122") return { valid: false, raw: stripped, reason: "non-RFC 4122 variant — disable 'strict RFC 4122'" };

  const fields = extractFields(lower);
  const props = computeProperties(trimmed, normalized, version, variant);

  let decoded = null;
  let unixMs = null;
  if (version === 1) {
    decoded = decodeUuidV1(fields);
    unixMs = decoded.timestamp.getTime();
  } else if (version === 7) {
    decoded = decodeUuidV7(fields);
    unixMs = decoded.timestamp.getTime();
  }

  return { valid: true, raw: normalized, version, variant, fields, decoded, unixMs, ...props };
}

// Friendly short label for a parsed UUID's version: the nil and max sentinels
// read as words, every other version as v<N>. One source of truth so the
// banner, properties, and status bar never disagree with the version column.
export function versionLabel(result) {
  if (!result?.valid) return null;
  if (result.isNil) return "nil";
  if (result.version === 15) return "max";
  return `v${result.version}`;
}

export function decodeUuidV7(fields) {
  const hex =
    fields.timeLow +
    fields.timeMid +
    fields.timeHighAndVersion +
    fields.clockSeqAndReserved +
    fields.node;
  const unixMs = parseInt(hex.slice(0, 12), 16);
  const sequence = parseInt(hex.slice(13, 16), 16);
  const timestamp = new Date(unixMs);
  return {
    timestamp,
    timestampIso: timestamp.toISOString(),
    timestampRelative: formatRelativeTime(timestamp),
    sequence,
    node: null,
    clockSeq: null,
  };
}

export function decodeUuidV1(fields) {
  const timeLow = BigInt("0x" + fields.timeLow);
  const timeMid = BigInt("0x" + fields.timeMid);
  const timeHigh = BigInt("0x" + fields.timeHighAndVersion) & 0x0fffn;
  const ticks = (timeHigh << 48n) | (timeMid << 32n) | timeLow;
  const unixMs = Number((ticks - GREGORIAN_OFFSET) / 10000n);
  const clockSeq = parseInt(fields.clockSeqAndReserved, 16) & 0x3fff;
  const timestamp = new Date(unixMs);
  return {
    timestamp,
    timestampIso: timestamp.toISOString(),
    timestampRelative: formatRelativeTime(timestamp),
    sequence: null,
    node: fields.node,
    clockSeq,
  };
}

export function formatRelativeTime(date) {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(Math.abs(diffMs) / 1000);
  const diffMin = Math.round(Math.abs(diffMs) / 60000);
  const diffHour = Math.round(Math.abs(diffMs) / 3600000);
  const diffDay = Math.round(Math.abs(diffMs) / 86400000);
  const sign = diffMs >= 0 ? -1 : 1;
  const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (diffSec < 60) return fmt.format(sign * diffSec, "second");
  if (diffMin < 60) return fmt.format(sign * diffMin, "minute");
  if (diffHour < 24) return fmt.format(sign * diffHour, "hour");
  if (diffDay < 30) return fmt.format(sign * diffDay, "day");
  const diffMonth = Math.round(Math.abs(diffMs) / (30 * 86400000));
  if (diffMonth < 24) return fmt.format(sign * diffMonth, "month");
  const diffYear = Math.round(Math.abs(diffMs) / (365 * 86400000));
  return fmt.format(sign * diffYear, "year");
}
