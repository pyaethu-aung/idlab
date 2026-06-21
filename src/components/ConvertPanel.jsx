import { KEY_META, KEY_OPT } from "../utils/platform";

const SAMPLES = [
  ["nil", "00000000-0000-0000-0000-000000000000"],
  ["v4",  "550e8400-e29b-41d4-a716-446655440000"],
  ["v7",  "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d"],
];

const ROWS = [
  { key: "canonical", label: "canonical" },
  { key: "compact",   label: "compact"   },
  { key: "upper",     label: "uppercase" },
  { key: "braces",    label: "braces"    },
  { key: "urn",       label: "urn:uuid"  },
  { key: "base64",    label: "base64url" },
  { key: "base32",    label: "base32"    },
  { key: "integer",   label: "integer"   },
  { key: "bytes",     label: "bytes"     },
];

function CxCopyButton({ copied, onClick }) {
  return (
    <button
      type="button"
      className={`cx-copy mono${copied ? " is-copied" : ""}`}
      onClick={onClick}
      aria-label={copied ? "Copied" : "Copy this value"}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

function ConvertPanel({ converter }) {
  const { rawInput, setRawInput, conversions, hasInput, copiedKey, copyRow, clearInput } =
    converter;

  return (
    <section className="validator-panel">
      <div className="v-workbench">
        <div className="v-rail">
          <div className="v-rail-section">
            <div className="v-rail-head">
              <span className="v-rail-key mono">paste uuid</span>
              <span className="v-rail-hint mono">{KEY_META}V</span>
            </div>
            <div className="v-input-field-wrap">
              <input
                type="text"
                className="v-input-field mono"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="UUID to convert"
              />
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
              {SAMPLES.map(([label, uuid]) => (
                <button
                  key={label}
                  type="button"
                  className={`v-sample-pill mono${rawInput === uuid ? " v-sample-pill--active" : ""}`}
                  onClick={() => setRawInput(uuid)}
                  aria-label={`Load ${label} sample UUID`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="v-panel-view">
          <div className="v-panel-body">
            {conversions ? (
              <div className="cx-rows" role="list" aria-label="UUID representations">
                {ROWS.map(({ key, label }) => (
                  <div key={key} className="cx-row" role="listitem">
                    <span className="cx-label mono">{label}</span>
                    <code className="cx-value mono">{conversions[key]}</code>
                    <CxCopyButton
                      copied={copiedKey === key}
                      onClick={() => copyRow(key, conversions[key])}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="v-empty-state">
                <span
                  className={`v-empty-msg mono${hasInput ? " v-empty-msg--error" : ""}`}
                >
                  {hasInput ? "not a valid UUID" : "paste a UUID to convert"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConvertPanel;
