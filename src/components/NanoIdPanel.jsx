import {
  NANOID_ALPHABETS,
  NANOID_MIN_SIZE,
  NANOID_MAX_SIZE,
  NANOID_MIN_COUNT,
  NANOID_MAX_COUNT,
} from "../utils/nanoid";
import Hero from "./Hero";
import { KEY_META } from "../utils/platform";

// Render the 1%-collision threshold compactly: a power of ten once it is large,
// a plain count for the rare tiny-keyspace configs.
function formatCollision(exp) {
  if (!Number.isFinite(exp)) return "—";
  if (exp >= 6) return `~10^${Math.round(exp)}`;
  return `~${Math.round(10 ** exp).toLocaleString()}`;
}

function RowCopyButton({ copied, onClick, label }) {
  return (
    <button
      type="button"
      className={`cx-copy mono${copied ? " is-copied" : ""}`}
      onClick={onClick}
      aria-label={copied ? "Copied" : `Copy ${label}`}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

function NanoIdPanel({ nanoid }) {
  const {
    size,
    count,
    alphabetId,
    ids,
    stats,
    copiedKey,
    setSize,
    setCount,
    setAlphabet,
    regenerate,
    copyValue,
    copyAll,
  } = nanoid;

  return (
    <section className="validator-panel">
      <Hero
        lead="Mint "
        accent="URL-safe"
        trail=" tokens"
        line2="at the length you choose."
        sub="Compact NanoIDs across five alphabets and any size from 2 to 36, with live bit-strength and collision math. Copied without leaving the keyboard."
      />
      <div className="v-workbench">
        <div className="v-rail">
          <div className="v-rail-section">
            <div className="v-rail-head">
              <span className="v-rail-key mono">generate</span>
              <span className="v-rail-hint mono">crypto random</span>
            </div>
            <div className="v-input-btns">
              <button
                type="button"
                className="v-input-btn v-input-btn--primary mono"
                onClick={() => regenerate()}
                aria-label="Mint NanoIDs"
                aria-keyshortcuts="Meta+Enter Control+Enter"
              >
                mint nanoids
                <kbd className="cta-kbd">{KEY_META}↵</kbd>
              </button>
            </div>
            <label htmlFor="nanoid-count" className="sr-only">
              How many ids to generate
            </label>
            <div className="v-rail-head">
              <span className="v-rail-key mono">count</span>
              <span className="v-rail-hint mono">{count}</span>
            </div>
            <input
              id="nanoid-count"
              type="range"
              className="rail-range"
              min={NANOID_MIN_COUNT}
              max={NANOID_MAX_COUNT}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              aria-valuetext={`${count} ids`}
            />
          </div>

          <div className="v-rail-section">
            <div className="v-rail-head">
              <span className="v-rail-key mono">length</span>
              <span className="v-rail-hint mono">{size} chars</span>
            </div>
            <label htmlFor="nanoid-size" className="sr-only">
              Characters per id
            </label>
            <input
              id="nanoid-size"
              type="range"
              className="rail-range"
              min={NANOID_MIN_SIZE}
              max={NANOID_MAX_SIZE}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              aria-valuetext={`${size} characters`}
            />
          </div>

          <div className="v-rail-section v-rail-section--last">
            <div className="v-rail-head">
              <span className="v-rail-key mono">alphabet</span>
              <span className="v-rail-hint mono">{stats.alphabetSize} symbols</span>
            </div>
            <div
              className="v-sample-row nano-alphabets"
              role="group"
              aria-label="Alphabet preset"
            >
              {NANOID_ALPHABETS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`v-sample-pill mono${alphabetId === id ? " v-sample-pill--active" : ""}`}
                  onClick={() => setAlphabet(id)}
                  aria-pressed={alphabetId === id}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="v-panel-view">
          <div className="v-panel-body">
            <div className="v-props-section">
              <div className="v-props-head">
                <span className="v-rail-key mono">generated · {ids.length}</span>
                <RowCopyButton
                  copied={copiedKey === "all"}
                  onClick={copyAll}
                  label="all ids"
                />
              </div>
              <div className="ulid-repr" role="list" aria-label="Generated NanoIDs">
                {ids.map((row, i) => (
                  <div key={row.id} className="cx-row" role="listitem">
                    <span className="cx-label mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <code className="cx-value mono">{row.value}</code>
                    <RowCopyButton
                      copied={copiedKey === row.id}
                      onClick={() => copyValue(row.id, row.value)}
                      label={`id ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="v-props-section">
              <div className="v-props-head">
                <span className="v-rail-key mono">entropy</span>
              </div>
              <div className="v-props-grid">
                <div className="v-prop-row">
                  <span className="v-prop-key mono">alphabet</span>
                  <span className="v-prop-spacer" />
                  <span className="mono v-prop-val">{stats.alphabetSize} symbols</span>
                </div>
                <div className="v-prop-row">
                  <span className="v-prop-key mono">length</span>
                  <span className="v-prop-spacer" />
                  <span className="mono v-prop-val">{size} chars</span>
                </div>
                <div className="v-prop-row v-prop-row--last">
                  <span className="v-prop-key mono">strength</span>
                  <span className="v-prop-spacer" />
                  <span className="mono v-prop-val">{stats.bits.toFixed(1)} bits</span>
                </div>
              </div>
              <p className="v-convert-note mono">
                A NanoID carries no version, variant, or timestamp: it is{" "}
                {stats.bits.toFixed(0)} bits of pure randomness. You would mint{" "}
                {formatCollision(stats.collisionExp)} ids before a 1% chance of a
                single collision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NanoIdPanel;
