import { formatRelativeTime } from "./uuidDecoder";

// KSUID: a 160-bit, lexicographically sortable identifier (a 32-bit
// second-precision timestamp, offset from a custom epoch, followed by 128
// bits of randomness), rendered as 27 base62 characters (spec:
// github.com/segmentio/ksuid). Unlike ULID/UUIDv7, KSUID has no sibling
// format to convert to or from -- it decodes to itself only, and its
// timestamp resolution is whole seconds, not milliseconds.

// Segment's base62 alphabet: digits, then uppercase, then lowercase.
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const KSUID_LEN = 27;
const TIMESTAMP_BYTES = 4;
const PAYLOAD_BYTES = 16;
const TOTAL_BYTES = TIMESTAMP_BYTES + PAYLOAD_BYTES; // 20 (160 bits)
const KSUID_EPOCH = 1400000000; // 2014-05-13T16:53:20Z, seconds since Unix epoch
const MAX_TIMESTAMP = 0xffffffff; // 2^32 - 1, the largest encodable offset
// 27 base62 digits (62^27) can represent slightly more than 2^160 values, so
// not every 27-char string is a valid 160-bit payload; decode rejects those.
const MAX_VALUE = (1n << BigInt(TOTAL_BYTES * 8)) - 1n;

// Char -> base62 value. Case-sensitive; there is no ambiguity aliasing (unlike
// ULID's Crockford Base32) because every character in the alphabet is unique.
const DECODE = (() => {
  const map = Object.create(null);
  for (let i = 0; i < BASE62.length; i += 1) {
    map[BASE62[i]] = BigInt(i);
  }
  return map;
})();

function bytesToBigInt(bytes) {
  let n = 0n;
  for (let i = 0; i < bytes.length; i += 1) {
    n = (n << 8n) | BigInt(bytes[i]);
  }
  return n;
}

// Encode a 160-bit value as 27 base62 characters, left-padded with the
// alphabet's zero digit.
function encodeBase62(n) {
  let value = n;
  let out = "";
  for (let i = 0; i < KSUID_LEN; i += 1) {
    out = BASE62[Number(value % 62n)] + out;
    value /= 62n;
  }
  return out;
}

// Mint a KSUID for the given instant (defaults to now). Throws RangeError
// when the timestamp falls outside the encodable 32-bit-second range (before
// 2014-05-13T16:53:20Z or after the offset overflows 32 bits).
export function generateKsuid(seedTime = Date.now()) {
  const ms = Math.floor(seedTime);
  const seconds = Math.floor(ms / 1000) - KSUID_EPOCH;
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > MAX_TIMESTAMP) {
    throw new RangeError(
      "KSUID timestamp must be within the encodable 32-bit second range"
    );
  }

  const payload = new Uint8Array(PAYLOAD_BYTES);
  crypto.getRandomValues(payload);

  const value = (BigInt(seconds) << 128n) | bytesToBigInt(payload);
  return encodeBase62(value);
}

// Decode a 27-character KSUID. Returns { valid: true, ... } with the
// timestamp and payload, or { valid: false, reason } with a position-aware
// diagnostic. Accepts surrounding whitespace.
export function decodeKsuid(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return { valid: false, reason: "paste a KSUID to decode" };
  }
  const trimmed = raw.trim();
  if (trimmed.length !== KSUID_LEN) {
    return {
      valid: false,
      reason: `expected 27 characters, got ${trimmed.length}`,
    };
  }

  let value = 0n;
  for (let i = 0; i < trimmed.length; i += 1) {
    const digit = DECODE[trimmed[i]];
    if (digit === undefined) {
      return {
        valid: false,
        reason: `invalid character '${trimmed[i]}' at position ${i + 1}`,
      };
    }
    value = value * 62n + digit;
  }
  if (value > MAX_VALUE) {
    return {
      valid: false,
      reason: "value overflows 160 bits: not a valid KSUID",
    };
  }

  const hex = value.toString(16).padStart(TOTAL_BYTES * 2, "0");
  const seconds = parseInt(hex.slice(0, TIMESTAMP_BYTES * 2), 16);
  const timestampMs = (seconds + KSUID_EPOCH) * 1000;
  const timestamp = new Date(timestampMs);
  const payloadHex = hex.slice(TIMESTAMP_BYTES * 2);

  return {
    valid: true,
    ksuid: trimmed,
    timestampMs,
    timestamp,
    timestampIso: timestamp.toISOString(),
    timestampRelative: formatRelativeTime(timestamp),
    payload: `0x${payloadHex}`,
    raw: `0x${hex}`,
  };
}
