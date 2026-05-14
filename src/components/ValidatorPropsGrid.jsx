const VERSION_DETAIL = {
  0:  "nil — all zeros",
  1:  "gregorian-time (100 ns ticks)",
  3:  "name-based (MD5)",
  4:  "random (CSPRNG)",
  5:  "name-based (SHA-1)",
  6:  "reordered time",
  7:  "time-ordered (Unix-ms + rand)",
  15: "max — all ones",
};

function CheckIcon() {
  return <span className="v-prop-icon v-prop-icon--check" aria-hidden="true">✓</span>;
}
function MinusIcon() {
  return <span className="v-prop-icon v-prop-icon--minus" aria-hidden="true">−</span>;
}
function CrossIcon() {
  return <span className="v-prop-icon v-prop-icon--cross" aria-hidden="true">✕</span>;
}

function BoolValue({ value, trueLabel, falseLabel }) {
  return (
    <span className="v-prop-val-row">
      {value ? <CheckIcon /> : falseLabel === "false" ? <CrossIcon /> : <MinusIcon />}
      <span className={`mono v-prop-val${value ? "" : " v-prop-val--muted"}`}>
        {value ? trueLabel : falseLabel}
      </span>
    </span>
  );
}

function PropRow({ label, children, last }) {
  return (
    <div className={`v-prop-row${last ? " v-prop-row--last" : ""}`}>
      <span className="v-prop-key mono">{label}</span>
      <span className="v-prop-spacer" />
      {children}
    </div>
  );
}

function ValidatorPropsGrid({ result }) {
  if (!result?.valid) return null;

  const hyphenPositions = result.hasHyphens ? "positions 8,13,18,23" : "";
  const formatStr = result.format === "canonical"
    ? "canonical · 8-4-4-4-12"
    : result.format === "no-hyphens"
    ? "compact · 32 chars"
    : "braces · {8-4-4-4-12}";

  const lengthStr = `${result.charCount} chars · 16 bytes`;
  const versionDetail = VERSION_DETAIL[result.version] ?? `version ${result.version}`;

  return (
    <div className="v-props-section">
      <div className="v-props-head">
        <span className="v-rail-key mono">properties</span>
        <span className="v-rail-hint mono">8 checks</span>
      </div>
      <div className="v-props-grid">
        <PropRow label="version">
          <span className="v-prop-val-row">
            <span className="v-prop-pill mono">v{result.version}</span>
            <span className="mono v-prop-val">{versionDetail}</span>
          </span>
        </PropRow>

        <PropRow label="variant">
          <span className="mono v-prop-val">{result.variantBits}</span>
        </PropRow>

        {result.decoded && (
          <PropRow label="timestamp">
            <span className="v-prop-val-row">
              <span className="v-prop-pill mono">v{result.version}</span>
              <span className="mono v-prop-val">
                {result.decoded.timestampIso.slice(0, 19).replace("T", " ")} UTC
                {" · "}
                {result.decoded.timestampRelative}
              </span>
            </span>
          </PropRow>
        )}

        <PropRow label="format">
          <span className="mono v-prop-val">{formatStr}</span>
        </PropRow>

        <PropRow label="length">
          <span className="mono v-prop-val">{lengthStr}</span>
        </PropRow>

        <PropRow label="lowercase">
          <BoolValue value={result.isLowercase} trueLabel="true" falseLabel="false" />
        </PropRow>

        <PropRow label="hyphens">
          <BoolValue
            value={result.hasHyphens}
            trueLabel={`true · ${hyphenPositions}`}
            falseLabel="false"
          />
        </PropRow>

        <PropRow label="braces">
          <BoolValue value={result.hasBraces} trueLabel="true" falseLabel="false" />
        </PropRow>

        <PropRow label="nil uuid?" last>
          <BoolValue value={result.isNil} trueLabel="true" falseLabel="false" />
        </PropRow>
      </div>
    </div>
  );
}

export default ValidatorPropsGrid;
