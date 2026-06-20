import { useState, useMemo, useCallback } from "react";
import {
  NANOID_DEFAULT_SIZE,
  NANOID_DEFAULT_COUNT,
  NANOID_DEFAULT_ALPHABET,
  alphabetById,
  collisionExponent,
  generateNanoId,
  idEntropyBits,
} from "../utils/nanoid";

// Mint `count` ids of `size` chars from the given alphabet. Each id is a
// `{ id, value }` pair so React keys stay stable per row across copies.
function mintBatch(count, size, chars) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    value: generateNanoId(size, chars),
  }));
}

function useNanoId() {
  const [size, setSize] = useState(NANOID_DEFAULT_SIZE);
  const [count, setCount] = useState(NANOID_DEFAULT_COUNT);
  const [alphabetId, setAlphabetId] = useState(NANOID_DEFAULT_ALPHABET);
  const [ids, setIds] = useState(() =>
    mintBatch(NANOID_DEFAULT_COUNT, NANOID_DEFAULT_SIZE, alphabetById(NANOID_DEFAULT_ALPHABET).chars)
  );
  const [copiedKey, setCopiedKey] = useState(null);

  const alphabet = useMemo(() => alphabetById(alphabetId), [alphabetId]);

  // Entropy + collision readout for the current size/alphabet (not the batch).
  const stats = useMemo(() => {
    const alphabetSize = alphabet.chars.length;
    const bits = idEntropyBits(alphabetSize, size);
    return { alphabetSize, bits, collisionExp: collisionExponent(bits) };
  }, [alphabet, size]);

  // Re-mint with explicit overrides so a control change generates from the new
  // value immediately, without waiting for the state batch to flush.
  const regenerate = useCallback(
    (next = {}) => {
      const nextSize = next.size ?? size;
      const nextCount = next.count ?? count;
      const nextChars = (next.alphabetId ? alphabetById(next.alphabetId) : alphabet).chars;
      setIds(mintBatch(nextCount, nextSize, nextChars));
    },
    [size, count, alphabet]
  );

  const handleSetSize = useCallback(
    (value) => {
      setSize(value);
      regenerate({ size: value });
    },
    [regenerate]
  );

  const handleSetCount = useCallback(
    (value) => {
      setCount(value);
      regenerate({ count: value });
    },
    [regenerate]
  );

  const handleSetAlphabet = useCallback(
    (id) => {
      setAlphabetId(id);
      regenerate({ alphabetId: id });
    },
    [regenerate]
  );

  const copyValue = useCallback((key, value) => {
    if (!value || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }, []);

  const copyAll = useCallback(() => {
    const joined = ids.map((row) => row.value).join("\n");
    copyValue("all", joined);
  }, [ids, copyValue]);

  return {
    size,
    count,
    alphabetId,
    alphabet,
    ids,
    stats,
    copiedKey,
    setSize: handleSetSize,
    setCount: handleSetCount,
    setAlphabet: handleSetAlphabet,
    regenerate,
    copyValue,
    copyAll,
  };
}

export default useNanoId;
