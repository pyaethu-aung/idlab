import {
  MAX,
  NIL,
  v1 as uuidV1,
  v3 as uuidV3,
  v4 as uuidV4,
  v5 as uuidV5,
  v6 as uuidV6,
  v7 as uuidV7,
  v1ToV6,
  v6ToV1,
} from "uuid";

// RFC 9562 special-form UUIDs. Fall back to the literal strings on the rare
// chance the package does not export them, so the generator never goes blank.
export const NIL_UUID = NIL ?? "00000000-0000-0000-0000-000000000000";
export const MAX_UUID = MAX ?? "ffffffff-ffff-ffff-ffff-ffffffffffff";

// Versions that produce one fixed, deterministic value: the name-based pair
// (v3/v5) and the RFC 9562 sentinels (nil/max). Used to lock batch + regen.
export const constantVersions = ["nil", "max"];
export const isConstantVersion = (version) => constantVersions.includes(version);

export const defaultOptions = {
  uppercase: false,
  trimHyphens: false,
  wrapBraces: false,
};

export const namespacePresets = [
  { id: "dns",  label: "DNS",   value: "6ba7b810-9dad-11d1-80b4-00c04fd430c8" },
  { id: "url",  label: "URL",   value: "6ba7b811-9dad-11d1-80b4-00c04fd430c8" },
  { id: "oid",  label: "OID",   value: "6ba7b812-9dad-11d1-80b4-00c04fd430c8" },
  { id: "x500", label: "X.500", value: "6ba7b814-9dad-11d1-80b4-00c04fd430c8" },
];

export const defaultNamespace = namespacePresets[0].value;

export const uuidNameBased = { v3: uuidV3, v5: uuidV5 };

export const makeNameBasedGenerator = (versionFn, namespace, name) =>
  () => versionFn(name, namespace);

// Versions that encode a timestamp directly in the UUID, so they can be minted
// for an arbitrary moment by passing { msecs }. Used to gate the pin-time UI.
export const timeBasedVersions = ["v1", "v6", "v7"];
export const isTimeBasedVersion = (version) =>
  timeBasedVersions.includes(version);

const timeBasedFns = { v1: uuidV1, v6: uuidV6, v7: uuidV7 };

// Format a moment as a local-time <input type="datetime-local"> value
// (YYYY-MM-DDTHH:MM:SS), defaulting to the current instant. Used to seed the
// pin-time controls so they open on "now" rather than a blank placeholder.
export const toDateTimeLocal = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

// Parse a browser <input type="datetime-local"> value into epoch milliseconds.
// Returns null for empty or unparseable input so callers fall back to live time.
export const parseDateTimeLocal = (value) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
};

// Build a zero-arg generator that stamps every UUID with the given moment.
// Returns null when the version is not time-based, the timestamp is invalid, or
// the package function is unavailable, so the caller can keep live generation.
export const makeTimestampGenerator = (version, msecs) => {
  const versionFn = timeBasedFns[version];
  if (
    typeof versionFn !== "function" ||
    typeof msecs !== "number" ||
    !Number.isFinite(msecs)
  ) {
    return null;
  }
  return () => versionFn({ msecs });
};

export const uuidGenerators = {
  v1: () => (typeof uuidV1 === "function" ? uuidV1() : createUuid()),
  v4: () => (typeof uuidV4 === "function" ? uuidV4() : createUuid()),
  v6: () => {
    if (typeof uuidV6 === "function") {
      return uuidV6();
    }

    // v6 is a field reorder of v1; fall back through v1 to keep output valid.
    return typeof uuidV1 === "function" ? uuidV1() : createUuid();
  },
  v7: () => {
    if (typeof uuidV7 === "function") {
      return uuidV7();
    }

    return typeof uuidV4 === "function" ? uuidV4() : createUuid();
  },
  nil: () => NIL_UUID,
  max: () => MAX_UUID,
};

export const buildBatch = (count, generator = uuidGenerators.v4) =>
  Array.from({ length: count }, () => generator());

// v1 and v6 hold the same time, clock-seq, and node data with their high/low
// fields swapped. Convert between the two using the uuid package; returns null
// for any other version or when the package helpers are unavailable, so callers
// can treat null as "no conversion offered".
export const convertTimeUuid = (value, version) => {
  try {
    if (version === 1 && typeof v1ToV6 === "function") {
      return v1ToV6(value);
    }
    if (version === 6 && typeof v6ToV1 === "function") {
      return v6ToV1(value);
    }
  } catch {
    return null;
  }
  return null;
};

export const createUuid = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // Secure fallback using getRandomValues (RFC 4122 v4)
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const formatUuid = (value, options) => {
  let next = value;

  if (options.trimHyphens) {
    next = next.replace(/-/g, "");
  }

  if (options.uppercase) {
    next = next.toUpperCase();
  }

  if (options.wrapBraces) {
    next = `{${next}}`;
  }

  return next;
};
