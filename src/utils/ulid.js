import { formatRelativeTime } from "./uuidDecoder";

// ULID: a 128-bit, lexicographically sortable identifier (a 48-bit Unix
// millisecond timestamp followed by 80 bits of randomness), rendered as 26
// Crockford Base32 characters (spec: github.com/ulid/spec). It shares its
// timestamp layout with UUIDv7, so the two convert losslessly: the same 128
// bits, re-encoded between Crockford Base32 and hexadecimal.

// Crockford Base32: the same alphabet uuidConvert.js uses, minus I, L, O, U.
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ULID_LEN = 26;
const TIME_LEN = 10; // first 10 chars hold the 48-bit timestamp
const RANDOM_LEN = 16; // last 16 chars hold the 80-bit randomness
const MAX_TIME = 0xffffffffffff; // 2^48 - 1, the largest encodable timestamp

// Char → 5-bit value. Case-insensitive, with Crockford's ambiguity aliases
// (I/L → 1, O → 0) so a hand-typed ULID still decodes. U is never valid.
const DECODE = (() => {
  const map = Object.create(null);
  for (let i = 0; i < ENCODING.length; i += 1) {
    map[ENCODING[i]] = i;
    map[ENCODING[i].toLowerCase()] = i;
  }
  map.I = map.i = map.L = map.l = 1;
  map.O = map.o = 0;
  return map;
})();

const UUID_CANONICAL_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_COMPACT_RE = /^[0-9a-f]{32}$/i;

function insertHyphens(hex) {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Strip braces / urn:uuid: wrappers and hyphens, returning a lowercase 32-char
// hex string, or null when the input is not a UUID in any accepted form.
function normalizeUuidHex(input) {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (s.startsWith("{") && s.endsWith("}")) s = s.slice(1, -1).trim();
  if (s.toLowerCase().startsWith("urn:uuid:")) s = s.slice(9);
  if (UUID_CANONICAL_RE.test(s)) return s.replace(/-/g, "").toLowerCase();
  if (UUID_COMPACT_RE.test(s)) return s.toLowerCase();
  return null;
}

// Encode a non-negative millisecond timestamp as `len` Crockford characters.
function encodeTime(ms, len) {
  let time = ms;
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out = ENCODING[time % 32] + out;
    time = Math.floor(time / 32);
  }
  return out;
}

// 80 bits of randomness as 16 Crockford characters. Each character takes the
// low 5 bits of a fresh random byte, so the distribution is uniform (no modulo
// bias). Uses Web Crypto for cryptographic-quality entropy.
function encodeRandom(len) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += ENCODING[bytes[i] & 0x1f];
  }
  return out;
}

// Mint a ULID for the given instant (defaults to now). Throws RangeError when
// the timestamp falls outside the encodable 48-bit range.
export function generateUlid(seedTime = Date.now()) {
  const ms = Math.floor(seedTime);
  if (!Number.isFinite(ms) || ms < 0 || ms > MAX_TIME) {
    throw new RangeError("ULID timestamp must be between 0 and 2^48 - 1");
  }
  return encodeTime(ms, TIME_LEN) + encodeRandom(RANDOM_LEN);
}

// Reduce a Crockford string to a BigInt (5 bits per character).
function crockfordToBigInt(str) {
  let n = 0n;
  for (let i = 0; i < str.length; i += 1) {
    n = n * 32n + BigInt(DECODE[str[i]]);
  }
  return n;
}

// Decode a 26-character ULID. Returns { valid: true, ... } with the timestamp,
// randomness, and equivalent UUID forms, or { valid: false, reason } with a
// position-aware diagnostic. Accepts surrounding whitespace and any case.
export function decodeUlid(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return { valid: false, reason: "paste a ULID to decode" };
  }
  const trimmed = raw.trim();
  if (trimmed.length !== ULID_LEN) {
    return {
      valid: false,
      reason: `expected 26 characters, got ${trimmed.length}`,
    };
  }
  for (let i = 0; i < trimmed.length; i += 1) {
    if (DECODE[trimmed[i]] === undefined) {
      return {
        valid: false,
        reason: `invalid character '${trimmed[i]}' at position ${i + 1}`,
      };
    }
  }
  // The first character carries the top 5 bits of the 128-bit value; only the
  // low 3 are usable, so anything above 7 overflows 128 bits.
  if (DECODE[trimmed[0]] > 7) {
    return {
      valid: false,
      reason: "timestamp overflow: the first character must be 0-7",
    };
  }

  const ulid = trimmed.toUpperCase();
  const timeChars = ulid.slice(0, TIME_LEN);
  const randomChars = ulid.slice(TIME_LEN);

  const timestampMs = Number(crockfordToBigInt(timeChars));
  const timestamp = new Date(timestampMs);
  const randomnessHex = crockfordToBigInt(randomChars)
    .toString(16)
    .padStart(20, "0");
  const hex = crockfordToBigInt(ulid).toString(16).padStart(32, "0");

  return {
    valid: true,
    ulid,
    timestampMs,
    timestamp,
    timestampIso: timestamp.toISOString(),
    timestampRelative: formatRelativeTime(timestamp),
    randomness: `0x${randomnessHex}`,
    randomnessChars: randomChars,
    uuid: insertHyphens(hex),
    uuidCompact: hex,
  };
}

// Convert a ULID to its canonical UUID string, or null when the ULID is
// malformed. The 128 bits are preserved exactly.
export function ulidToUuid(ulid) {
  const decoded = decodeUlid(ulid);
  return decoded.valid ? decoded.uuid : null;
}

// Convert any accepted UUID form to a 26-character ULID, or null when the
// input is not a UUID. Mirrors uuidConvert.js's Crockford Base32 row.
export function uuidToUlid(uuid) {
  const hex = normalizeUuidHex(uuid);
  if (!hex) return null;
  let n = BigInt(`0x${hex}`);
  let out = "";
  for (let i = 0; i < ULID_LEN; i += 1) {
    out = ENCODING[Number(n & 0x1fn)] + out;
    n >>= 5n;
  }
  return out;
}

// Unified entry point for the ULID tab: accept either a ULID or a UUIDv7 and
// return one decoded shape for both. UUIDv7 is the only UUID version accepted
// because it is the one that shares ULID's 48-bit millisecond timestamp; other
// versions encode time differently (or not at all) and would decode to a
// meaningless instant. The Converter tab handles version-agnostic UUID forms.
export function inspectIdentifier(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return { valid: false, reason: "paste a ULID or UUIDv7" };
  }
  const trimmed = raw.trim();

  // A bare 26-char token is a ULID; let decodeUlid own the diagnostics.
  if (trimmed.length === ULID_LEN) {
    const decoded = decodeUlid(trimmed);
    return decoded.valid ? { ...decoded, kind: "ulid" } : decoded;
  }

  const hex = normalizeUuidHex(trimmed);
  if (hex) {
    const version = parseInt(hex[12], 16);
    if (version !== 7) {
      return {
        valid: false,
        reason: `UUID is v${version}: ULID conversion needs v7 (it shares the millisecond timestamp). Use the Converter tab for other versions.`,
      };
    }
    const ulid = uuidToUlid(hex);
    const decoded = decodeUlid(ulid);
    return { ...decoded, kind: "uuidv7", uuid: insertHyphens(hex) };
  }

  return { valid: false, reason: "not a ULID or UUID" };
}
