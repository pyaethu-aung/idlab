import { KEY_META, KEY_OPT } from "../utils/platform";

const SAMPLE_ROWS = [
  ["nil", "v1", "v6", "v7"],
  ["v3", "v4", "v5"],
];

const OPTIONS_CONFIG = [
  { key: "strictRfc",       label: "strict RFC 4122",   desc: "reject reserved variants" },
  { key: "allowBraces",     label: "allow braces { }",  desc: "accept {xxxxxxxx-...} form" },
  { key: "allowNoHyphens",  label: "allow no-hyphens",  desc: "accept 32-char compact form" },
];

function Toggle({ on }) {
  return (
    <div className={`v-toggle${on ? " v-toggle--on" : ""}`} aria-hidden="true">
      <div className="v-toggle-knob" />
    </div>
  );
}

// Describe a single line the way the old single-UUID inspector did, so pasting
// one value still reads as "36 chars · hyphenated" rather than "1 line".
function singleLineHint(line) {
  const compactLen = line.replace(/[{} ]/g, "").replace(/-/g, "").length;
  const hasHyphens = line.includes("-");
  return hasHyphens
    ? `${line.trim().replace(/[{}]/g, "").length} chars · hyphenated`
    : `${compactLen} chars · compact`;
}

function ValidatorRail({
  value,
  onChange,
  options,
  onToggleOption,
  onClear,
  onLoadSample,
  onLoadSampleList,
  activeSample,
}) {
  const lines = value ? value.split(/\r?\n/).filter((line) => line.trim()) : [];
  const lineCount = lines.length;
  const meta =
    lineCount === 0
      ? ""
      : lineCount === 1
      ? singleLineHint(lines[0])
      : `${lineCount} lines`;

  return (
    <div className="v-rail">
      {/* Input Section */}
      <div className="v-rail-section">
        <div className="v-rail-head">
          <span className="v-rail-key mono">paste uuid(s)</span>
          <span className="v-rail-hint mono">{KEY_META}V · one per line</span>
        </div>
        <div className="v-input-field-wrap">
          <textarea
            className="v-input-field bulk-textarea mono"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\n…paste more on new lines"}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={6}
            aria-label="UUIDs to validate, one per line"
          />
          {value && (
            <div className="v-input-meta-row">
              <span className="mono v-input-meta-text">{meta}</span>
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
            onClick={onClear}
            disabled={!value}
            aria-label="Clear input"
          >
            <span aria-hidden="true">×</span> clear
          </button>
          <button
            type="button"
            className="v-input-btn v-input-btn--secondary mono"
            onClick={onLoadSampleList}
            aria-label="Load a sample list"
          >
            sample list
          </button>
        </div>
      </div>

      {/* Samples Section */}
      <div className="v-rail-section">
        <div className="v-rail-head">
          <span className="v-rail-key mono">try one</span>
          <span className="v-rail-hint mono">click to load</span>
        </div>
        {SAMPLE_ROWS.map((row, ri) => (
          <div key={ri} className="v-sample-row">
            {row.map((ver) => (
              <button
                key={ver}
                type="button"
                className={`v-sample-pill mono${activeSample === ver ? " v-sample-pill--active" : ""}`}
                onClick={() => onLoadSample(ver)}
                aria-label={`Load ${ver} sample UUID`}
                aria-pressed={activeSample === ver}
              >
                {ver}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Options Section */}
      <div className="v-rail-section v-rail-section--last">
        <div className="v-rail-head">
          <span className="v-rail-key mono">accept</span>
          <span className="v-rail-hint mono">{KEY_OPT}R · {KEY_OPT}{"{"} · {KEY_OPT}-</span>
        </div>
        <div className="v-opt-stack">
          {OPTIONS_CONFIG.map(({ key, label, desc }) => (
            <button
              key={key}
              type="button"
              className="v-opt-row"
              onClick={() => onToggleOption(key)}
              aria-pressed={options[key]}
            >
              <Toggle on={options[key]} />
              <div className="v-opt-text">
                <span className="mono v-opt-label">{label}</span>
                <span className="mono v-opt-desc">{desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ValidatorRail;
