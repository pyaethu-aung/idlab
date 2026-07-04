import Hero from "./Hero";
import { KEY_META, KEY_OPT } from "../utils/platform";
import { KSUID_SAMPLES } from "../hooks/useKsuid";

const REPR_ROWS = [
  { key: "ksuid", label: "ksuid" },
  { key: "payload", label: "payload" },
  { key: "raw", label: "raw" },
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
  const utc = `${result.timestampIso.slice(0, 19).replace("T", " ")} UTC`;

  return (
    <>
      <div className="v-result-section">
        <div className="v-banner v-banner--valid">
          <span className="v-banner-icon" aria-hidden="true">
            ✓
          </span>
          <span className="v-banner-text">
            <span className="v-banner-line1">valid KSUID</span>
            <span className="v-banner-line2 mono">
              27-char base62 · 32-bit second timestamp + 128-bit random
            </span>
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
              <span className="v-prop-pill mono">KSUID</span>
              <span className="mono v-prop-val">
                {utc} · {result.timestampRelative}
              </span>
            </span>
          </div>
          <div className="v-prop-row v-prop-row--last">
            <span className="v-prop-key mono">payload</span>
            <span className="v-prop-spacer" />
            <span className="mono v-prop-val">{result.payload}</span>
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
          KSUID has no sibling format to convert to or from: the timestamp is
          second-precision only, and the 160-bit value has no 128-bit UUID
          equivalent. It decodes to itself.
        </p>
      </div>
    </>
  );
}

function KsuidPanel({ ksuid }) {
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
  } = ksuid;

  const isValid = result?.valid ?? false;

  return (
    <section className="validator-panel">
      <Hero
        lead="Mint "
        accent="k-sortable"
        trail=" ids"
        line2="ordered to the second."
        sub="Generate KSUIDs and decode any KSUID you already have. A 32-bit second-precision clock plus 128 bits of randomness, never leaving the browser."
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
                aria-label="Mint a KSUID"
                aria-keyshortcuts="Meta+Enter Control+Enter"
              >
                mint a ksuid
                <kbd className="cta-kbd">{KEY_META}↵</kbd>
              </button>
            </div>
          </div>

          <div className="v-rail-section">
            <div className="v-rail-head">
              <span className="v-rail-key mono">paste ksuid</span>
              <span className="v-rail-hint mono">{KEY_META}V</span>
            </div>
            <div className="v-input-field-wrap">
              <input
                type="text"
                className="v-input-field mono"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="2YBXZIdZpuEB0Z0gxchzBCwPdBh"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="KSUID to decode"
              />
              {rawInput && (
                <div className="v-input-meta-row">
                  <span className="mono v-input-meta-text">
                    {isValid ? "ksuid · valid" : `${rawInput.trim().length} chars`}
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
              {KSUID_SAMPLES.map(({ id, label }) => (
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
                  {hasInput ? result.reason : "mint or paste a KSUID to decode"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default KsuidPanel;
