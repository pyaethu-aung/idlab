const VERSIONS = [
  { id: "v4", label: "v4", title: "Random",      desc: "Web Crypto entropy, the everyday workhorse." },
  { id: "v1", label: "v1", title: "Time + Node", desc: "Timestamp-first, sortable for logs and traces." },
  { id: "v7", label: "v7", title: "Unix Time",   desc: "Time-prefixed hybrid for distributed systems." },
];

const FORMAT_OPTS = [
  { key: "uppercase",   label: "uppercase()",   hint: "All hex chars uppercased" },
  { key: "trimHyphens", label: "stripHyphens()", hint: "Compact 32-char string, no dashes" },
  { key: "wrapBraces",  label: "wrapBraces()",  hint: "Wrap as {uuid} for config files" },
];

const BATCH_PRESETS = [1, 8, 25, 100, 200];

function ControlPanel({
  batchSize,
  visibleBatchSize,
  selectedVersion,
  options,
  onBatchChange,
  onBatchCommit,
  onVersionChange,
  onToggleOption,
}) {
  return (
    <aside className="rail">
      {/* Version */}
      <div className="rail-section">
        <div className="rail-head">
          <span className="rail-key mono">version</span>
          <span className="rail-hint mono">⌥1 · ⌥2 · ⌥3</span>
        </div>
        <div className="version-stack">
          {VERSIONS.map((v) => {
            const active = v.id === selectedVersion;
            return (
              <button
                key={v.id}
                type="button"
                className={`version-row${active ? " is-active" : ""}`}
                onClick={() => onVersionChange(v.id)}
              >
                <span className="version-tag mono">{v.label}</span>
                <span className="version-meta">
                  <span className="version-title">{v.title}</span>
                  <span className="version-desc">{v.desc}</span>
                </span>
                <span className="version-pip" aria-hidden="true">{active ? "●" : ""}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Batch */}
      <div className="rail-section">
        <div className="rail-head">
          <span className="rail-key mono">batch</span>
          <span className="rail-hint mono">⌥↑/↓</span>
        </div>
        <div className="batch-display">
          <span className="batch-num mono">{String(batchSize).padStart(3, "0")}</span>
          <span className="batch-of mono">/ 200</span>
        </div>
        <label htmlFor="batch-size" className="sr-only">Batch size</label>
        <input
          id="batch-size"
          type="range"
          min={1}
          max={200}
          value={batchSize}
          onChange={(e) => onBatchChange(Number(e.target.value))}
          onPointerUp={onBatchCommit}
          onMouseUp={onBatchCommit}
          onTouchEnd={onBatchCommit}
          onKeyUp={(e) => {
            const commitKeys = ["Enter", " ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
            if (commitKeys.includes(e.key)) onBatchCommit();
          }}
          className="rail-range"
        />
        <div className="batch-foot mono">
          showing {visibleBatchSize} · download up to {batchSize}
        </div>
        <div className="batch-presets">
          {BATCH_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              className={`preset-chip mono${batchSize === n ? " is-active" : ""}`}
              onClick={() => { onBatchChange(n); onBatchCommit?.(n); }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="rail-section">
        <div className="rail-head">
          <span className="rail-key mono">format</span>
          <span className="rail-hint mono">⌥U · ⌥H · ⌥B</span>
        </div>
        <div className="opt-stack">
          {FORMAT_OPTS.map((o) => (
            <label
              key={o.key}
              className={`opt-row${options[o.key] ? " is-on" : ""}`}
            >
              <span className="opt-check" aria-hidden="true">
                {options[o.key] ? "▣" : "□"}
              </span>
              <span className="opt-text">
                <span className="opt-label mono">{o.label}</span>
                <span className="opt-hint">{o.hint}</span>
              </span>
              <input
                type="checkbox"
                checked={options[o.key]}
                onChange={() => onToggleOption(o.key)}
                style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              />
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default ControlPanel;
