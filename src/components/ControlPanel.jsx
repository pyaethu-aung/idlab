import { KEY_OPT } from "../utils/platform";
import { namespacePresets } from "../utils/uuid";

const NS_PLACEHOLDERS = {
  [namespacePresets[0].value]: "e.g. example.com",
  [namespacePresets[1].value]: "e.g. https://example.com",
  [namespacePresets[2].value]: "e.g. 1.2.840.113549",
  [namespacePresets[3].value]: "e.g. cn=John,dc=example,dc=com",
};

const VERSIONS = [
  { id: "v4", label: "v4", title: "Random",       desc: "Web Crypto entropy, the everyday workhorse." },
  { id: "v1", label: "v1", title: "Time + Node",  desc: "Timestamp-first, sortable for logs and traces." },
  { id: "v6", label: "v6", title: "Reordered",    desc: "Field-swapped v1 that sorts in index order." },
  { id: "v7", label: "v7", title: "Unix Time",    desc: "Time-prefixed hybrid for distributed systems." },
  { id: "v3",  label: "v3",  title: "Name · MD5",   desc: "Deterministic from namespace + name using MD5." },
  { id: "v5",  label: "v5",  title: "Name · SHA-1", desc: "Deterministic from namespace + name using SHA-1." },
  { id: "nil", label: "nil", title: "All zeroes",   desc: "Sentinel UUID for empty or default values." },
  { id: "max", label: "max", title: "All ones",     desc: "RFC 9562 sentinel for upper-bound values." },
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
  isNameBased,
  isFixed,
  namespace,
  name,
  options,
  onBatchChange,
  onBatchCommit,
  onVersionChange,
  onNamespaceChange,
  onNameChange,
  onToggleOption,
}) {
  return (
    <aside className="rail">
      {/* Version */}
      <div className="rail-section">
        <div className="rail-head">
          <span className="rail-key mono">version</span>
          <span className="rail-hint mono">{KEY_OPT}1–8</span>
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
                aria-pressed={active}
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

      {/* Namespace + Name (v3/v5 only) */}
      {isNameBased && (
        <div className="rail-section">
          <div className="rail-head">
            <span className="rail-key mono">namespace</span>
          </div>
          <div className="ns-grid" role="group" aria-label="Namespace preset">
            {namespacePresets.map((ns) => (
              <button
                key={ns.id}
                type="button"
                className={`ns-chip mono${namespace === ns.value ? " is-active" : ""}`}
                onClick={() => onNamespaceChange(ns.value)}
                aria-pressed={namespace === ns.value}
              >
                {ns.label}
              </button>
            ))}
          </div>
          <div className="rail-head name-section-head">
            <span className="rail-key mono">name</span>
          </div>
          <input
            type="text"
            className="name-input mono"
            placeholder={NS_PLACEHOLDERS[namespace] ?? "e.g. example.com"}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            aria-label="Name for deterministic UUID generation"
            aria-describedby={name.trim() === "" ? "name-empty-hint" : undefined}
            spellCheck={false}
            autoComplete="off"
          />
          {name.trim() === "" && (
            <p id="name-empty-hint" className="name-empty-hint mono" aria-live="polite">
              Empty name — output will repeat until you type a value
            </p>
          )}
        </div>
      )}

      {/* Batch */}
      <div className={`rail-section${isFixed ? " is-disabled" : ""}`} aria-disabled={isFixed || undefined}>
        <div className="rail-head">
          <span className="rail-key mono">batch</span>
          <span className="rail-hint mono">{KEY_OPT}↑/↓</span>
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
          onPointerUp={() => onBatchCommit()}
          onMouseUp={() => onBatchCommit()}
          onTouchEnd={() => onBatchCommit()}
          onKeyUp={(e) => {
            const commitKeys = ["Enter", " ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
            if (commitKeys.includes(e.key)) onBatchCommit();
          }}
          className="rail-range"
          disabled={isFixed}
        />
        <div className="batch-foot mono">
          {isFixed
            ? "fixed output · 1 UUID"
            : `showing ${visibleBatchSize} · download up to ${batchSize}`}
        </div>
        <div className="batch-presets">
          {BATCH_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              className={`preset-chip mono${batchSize === n ? " is-active" : ""}`}
              onClick={() => { onBatchChange(n); onBatchCommit?.(n); }}
              aria-pressed={batchSize === n}
              disabled={isFixed}
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
          <span className="rail-hint mono">{KEY_OPT}U · {KEY_OPT}H · {KEY_OPT}B</span>
        </div>
        <div className="opt-stack">
          {FORMAT_OPTS.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`opt-row${options[o.key] ? " is-on" : ""}`}
              onClick={() => onToggleOption(o.key)}
              aria-pressed={options[o.key]}
            >
              <span className="opt-check" aria-hidden="true">
                {options[o.key] ? "▣" : "□"}
              </span>
              <span className="opt-text">
                <span className="opt-label mono">{o.label}</span>
                <span className="opt-hint">{o.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default ControlPanel;
