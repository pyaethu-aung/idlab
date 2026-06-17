const UUID_HEX_RE = /^[0-9a-f]{32}$/;
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function normalizeHex(input) {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (s.startsWith("{") && s.endsWith("}")) s = s.slice(1, -1).trim();
  if (s.toLowerCase().startsWith("urn:uuid:")) s = s.slice(9);
  const hex = s.replace(/-/g, "").toLowerCase();
  return UUID_HEX_RE.test(hex) ? hex : null;
}

function hexToBase64url(hex) {
  let bin = "";
  for (let i = 0; i < 16; i++) {
    bin += String.fromCharCode(parseInt(hex.slice(i * 2, i * 2 + 2), 16));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function hexToBase32(hex) {
  let n = BigInt("0x" + hex);
  const chars = [];
  for (let i = 0; i < 26; i++) {
    chars.unshift(CROCKFORD[Number(n & 0x1fn)]);
    n >>= 5n;
  }
  return chars.join("");
}

function hexToBytes(hex) {
  const parts = [];
  for (let i = 0; i < 16; i++) {
    parts.push("0x" + hex.slice(i * 2, i * 2 + 2));
  }
  return "[" + parts.join(", ") + "]";
}

export function convertUuid(input) {
  const hex = normalizeHex(input);
  if (!hex) return null;

  const canonical = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");

  return {
    canonical,
    compact: hex,
    upper: canonical.toUpperCase(),
    braces: `{${canonical}}`,
    urn: `urn:uuid:${canonical}`,
    base64: hexToBase64url(hex),
    base32: hexToBase32(hex),
    integer: BigInt("0x" + hex).toString(10),
    bytes: hexToBytes(hex),
  };
}
