const OPTIONS_CONFIG = [
  { key: "strictRfc",      label: "strict RFC 4122",  desc: "reject reserved variants" },
  { key: "allowBraces",    label: "allow braces { }", desc: "accept {xxxxxxxx-...} form" },
  { key: "allowNoHyphens", label: "allow no-hyphens", desc: "accept 32-char compact form" },
];

function Toggle({ on }) {
  return (
    <div className={`v-toggle${on ? " v-toggle--on" : ""}`} aria-hidden="true">
      <div className="v-toggle-knob" />
    </div>
  );
}

function BulkRail({ value, onChange, options, onToggleOption, onClear, onLoadSample }) {
  const lineCount = value
    ? value.split(/\r?\n/).filter((line) => line.trim()).length
    : 0;

  return (
    <div className="v-rail">
      {/* Input Section */}
      <div className="v-rail-section">
        <div className="v-rail-head">
          <span className="v-rail-key mono">paste uuids</span>
          <span className="v-rail-hint mono">one per line</span>
        </div>
        <div className="v-input-field-wrap">
          <textarea
            className="v-input-field bulk-textarea mono"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={"550e8400-e29b-41d4-a716-446655440000\n018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d\n…"}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={8}
            aria-label="UUIDs to validate, one per line"
          />
          {value && (
            <div className="v-input-meta-row">
              <span className="mono v-input-meta-text">
                {lineCount} {lineCount === 1 ? "line" : "lines"}
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
            onClick={onClear}
            disabled={!value}
            aria-label="Clear input"
          >
            <span aria-hidden="true">×</span> clear
          </button>
          <button
            type="button"
            className="v-input-btn v-input-btn--secondary mono"
            onClick={onLoadSample}
            aria-label="Load a sample list"
          >
            sample
          </button>
        </div>
      </div>

      {/* Options Section */}
      <div className="v-rail-section v-rail-section--last">
        <div className="v-rail-head">
          <span className="v-rail-key mono">accept</span>
          <span className="v-rail-hint mono">applies to all</span>
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

export default BulkRail;
