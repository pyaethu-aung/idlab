function ValidatorConvert({ conversion, copied, onCopy }) {
  if (!conversion) return null;

  const { from, to, value } = conversion;

  return (
    <div className="v-convert-section">
      <div className="v-props-head">
        <span className="v-rail-key mono">convert</span>
        <span className="v-convert-route mono">v{from} → v{to}</span>
      </div>
      <div className="v-convert-card">
        <span className="v-prop-pill mono" aria-hidden="true">v{to}</span>
        <code className="v-convert-val mono">{value}</code>
        <button
          type="button"
          className={`v-convert-copy mono${copied ? " is-copied" : ""}`}
          onClick={onCopy}
          aria-label={copied ? "Copied" : `Copy version ${to} UUID`}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <p className="v-convert-note mono">
        Same timestamp, clock-sequence, and node as the v{from} input, with the
        time fields reordered so the value sorts in generation order.
      </p>
    </div>
  );
}

export default ValidatorConvert;
