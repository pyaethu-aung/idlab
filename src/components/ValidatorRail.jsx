const SAMPLE_ROWS = [
  ["nil", "v1", "v3"],
  ["v4", "v5", "v7"],
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

function ValidatorRail({ value, onChange, options, onToggleOption, onLoadSample, activeSample }) {
  const charCount = value ? value.replace(/[{} ]/g, "").replace(/-/g, "").length : 0;
  const hasHyphens = value ? value.includes("-") : false;
  const formatHint = !value
    ? ""
    : hasHyphens
    ? `${value.trim().replace(/[{}]/g, "").length} chars · hyphenated`
    : `${charCount} chars · compact`;

  return (
    <div className="v-rail">
      {/* Input Section */}
      <div className="v-rail-section">
        <div className="v-rail-head">
          <span className="v-rail-key mono">paste uuid</span>
          <span className="v-rail-hint mono">⌘V</span>
        </div>
        <div className="v-input-field-wrap">
          <input
            type="text"
            className="v-input-field mono"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="UUID input"
          />
          {value && (
            <div className="v-input-meta-row">
              <span className="mono v-input-meta-text">{formatHint}</span>
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
            onClick={() => onChange("")}
            disabled={!value}
            aria-label="Clear input"
          >
            <span aria-hidden="true">×</span> clear
          </button>
        </div>
      </div>

      {/* Samples Section */}
      <div className="v-rail-section">
        <div className="v-rail-head">
          <span className="v-rail-key mono">try a sample</span>
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
          <span className="v-rail-key mono">match</span>
          <span className="v-rail-hint mono">⌥R · ⌥{"{"} · ⌥-</span>
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
