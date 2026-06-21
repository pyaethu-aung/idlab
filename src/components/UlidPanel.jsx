import Hero from "./Hero";
import { KEY_META, KEY_OPT } from "../utils/platform";
import { ULID_SAMPLES } from "../hooks/useUlid";

const KIND_COPY = {
  ulid: {
    pill: "ULID",
    title: "valid ULID",
    detail: "26-char Crockford Base32 · 48-bit time + 80-bit random",
  },
  uuidv7: {
    pill: "UUIDv7",
    title: "valid UUIDv7",
    detail: "converted to ULID · shares the 48-bit millisecond timestamp",
  },
};

const REPR_ROWS = [
  { key: "ulid", label: "ulid" },
  { key: "uuid", label: "uuid" },
  { key: "uuidCompact", label: "compact" },
];

function ReprCopyButton({ copied, onClick, label }) {
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

function DecodedResult({ result, copiedKey, copyValue }) {
  const kind = KIND_COPY[result.kind] ?? KIND_COPY.ulid;
  const utc = `${result.timestampIso.slice(0, 19).replace("T", " ")} UTC`;

  return (
    <>
      <div className="v-result-section">
        <div className="v-banner v-banner--valid">
          <span className="v-banner-icon" aria-hidden="true">
            ✓
          </span>
          <span className="v-banner-text">
            <span className="v-banner-line1">{kind.title}</span>
            <span className="v-banner-line2 mono">{kind.detail}</span>
          </span>
        </div>
      </div>

      <div className="v-props-section">
        <div className="v-props-head">
          <span className="v-rail-key mono">decoded</span>
        </div>
        <div className="v-props-grid">
          <div className="v-prop-row">
            <span className="v-prop-key mono">timestamp</span>
            <span className="v-prop-spacer" />
            <span className="v-prop-val-row">
              <span className="v-prop-pill mono">{kind.pill}</span>
              <span className="mono v-prop-val">
                {utc} · {result.timestampRelative}
              </span>
            </span>
          </div>
          <div className="v-prop-row">
            <span className="v-prop-key mono">epoch ms</span>
            <span className="v-prop-spacer" />
            <span className="mono v-prop-val">{result.timestampMs}</span>
          </div>
          <div className="v-prop-row v-prop-row--last">
            <span className="v-prop-key mono">randomness</span>
            <span className="v-prop-spacer" />
            <span className="mono v-prop-val">{result.randomness}</span>
          </div>
        </div>
      </div>

      <div className="v-props-section">
        <div className="v-props-head">
          <span className="v-rail-key mono">representations</span>
        </div>
        <div className="ulid-repr">
          {REPR_ROWS.map(({ key, label }) => (
            <div key={key} className="cx-row">
              <span className="cx-label mono">{label}</span>
              <code className="cx-value mono">{result[key]}</code>
              <ReprCopyButton
                copied={copiedKey === key}
                onClick={() => copyValue(key, result[key])}
                label={label}
              />
            </div>
          ))}
        </div>
        <p className="v-convert-note mono">
          A ULID and a UUIDv7 are the same 128 bits (a 48-bit millisecond
          timestamp plus randomness), written in Crockford Base32 or
          hexadecimal. The conversion is lossless.
        </p>
      </div>
    </>
  );
}

function UlidPanel({ ulid }) {
  const {
    rawInput,
    setRawInput,
    result,
    hasInput,
    generate,
    clearInput,
    loadSample,
    activeSample,
    copiedKey,
    copyValue,
  } = ulid;

  const isValid = result?.valid ?? false;

  return (
    <section className="validator-panel">
      <Hero
        lead="Mint "
        accent="time-sortable"
        trail=" ids"
        line2="ordered to the millisecond."
        sub="Generate ULIDs, decode any ULID or UUIDv7, and convert losslessly between the two. A 48-bit clock plus 80 bits of randomness, never leaving the browser."
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
                onClick={generate}
                aria-label="Mint a ULID"
                aria-keyshortcuts="Meta+Enter Control+Enter"
              >
                mint a ulid
                <kbd className="cta-kbd">{KEY_META}↵</kbd>
              </button>
            </div>
          </div>

          <div className="v-rail-section">
            <div className="v-rail-head">
              <span className="v-rail-key mono">paste ulid</span>
              <span className="v-rail-hint mono">{KEY_META}V</span>
            </div>
            <div className="v-input-field-wrap">
              <input
                type="text"
                className="v-input-field mono"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="01ARZ3NDEKTSV4RRFFQ69G5FAV"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="ULID or UUIDv7 to decode"
              />
              {rawInput && (
                <div className="v-input-meta-row">
                  <span className="mono v-input-meta-text">
                    {isValid
                      ? `${result.kind === "uuidv7" ? "uuidv7" : "ulid"} · valid`
                      : `${rawInput.trim().length} chars`}
                  </span>
                  <span className="v-input-meta-spacer" />
                  <span className="v-input-live-wrap">
                    <span className="v-input-live-dot" aria-hidden="true" />
                    <span className="mono v-input-live-lbl">live</span>
                  </span>
                </div>
              )}
            </div>
            <div className="v-input-btns">
              <button
                type="button"
                className="v-input-btn v-input-btn--secondary mono"
                onClick={clearInput}
                disabled={!rawInput}
                aria-label="Clear input"
                aria-keyshortcuts="Alt+Backspace"
              >
                <span aria-hidden="true">×</span> clear
                <kbd className="kbd-hint">{KEY_OPT}⌫</kbd>
              </button>
            </div>
          </div>

          <div className="v-rail-section v-rail-section--last">
            <div className="v-rail-head">
              <span className="v-rail-key mono">try a sample</span>
              <span className="v-rail-hint mono">click to load</span>
            </div>
            <div className="v-sample-row">
              {ULID_SAMPLES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`v-sample-pill mono${activeSample === id ? " v-sample-pill--active" : ""}`}
                  onClick={() => loadSample(id)}
                  aria-label={`Load ${label} sample`}
                  aria-pressed={activeSample === id}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="v-panel-view">
          <div className="v-panel-body">
            {isValid ? (
              <DecodedResult
                result={result}
                copiedKey={copiedKey}
                copyValue={copyValue}
              />
            ) : (
              <div className="v-empty-state">
                <span
                  className={`v-empty-msg mono${hasInput ? " v-empty-msg--error" : ""}`}
                >
                  {hasInput
                    ? result.reason
                    : "mint or paste a ULID to decode"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default UlidPanel;
