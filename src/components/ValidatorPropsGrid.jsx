import { versionLabel } from "../utils/uuidDecoder";

const VERSION_DETAIL = {
  0:  "all zeros",
  1:  "gregorian-time (100 ns ticks)",
  3:  "name-based (MD5)",
  4:  "random (CSPRNG)",
  5:  "name-based (SHA-1)",
  6:  "reordered time",
  7:  "time-ordered (Unix-ms + rand)",
  15: "all ones",
};

function MinusIcon() {
  return <span className="v-prop-icon v-prop-icon--minus" aria-hidden="true">−</span>;
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

  const versionDetail = VERSION_DETAIL[result.version] ?? `version ${result.version}`;

  const formatLabel = result.format === "canonical"
    ? "canonical · 8-4-4-4-12"
    : result.format === "no-hyphens"
    ? "compact · 32 chars"
    : "braces · {8-4-4-4-12}";
  const inputStr = `${formatLabel} · ${result.charCount} chars · ${result.isLowercase ? "lowercase" : "uppercase"}`;

  return (
    <div className="v-props-section">
      <div className="v-props-head">
        <span className="v-rail-key mono">properties</span>
      </div>
      <div className="v-props-grid">
        <PropRow label="version">
          <span className="v-prop-val-row">
            <span className="v-prop-pill mono">{versionLabel(result)}</span>
            <span className="mono v-prop-val">{versionDetail}</span>
          </span>
        </PropRow>

        <PropRow label="variant">
          <span className="mono v-prop-val">{result.variantBits}</span>
        </PropRow>

        <PropRow label="timestamp">
          {result.decoded ? (
            <span className="v-prop-val-row">
              <span className="v-prop-pill mono">{versionLabel(result)}</span>
              <span className="mono v-prop-val">
                {result.decoded.timestampIso.slice(0, 19).replace("T", " ")} UTC
                {" · "}
                {result.decoded.timestampRelative}
              </span>
            </span>
          ) : (
            <span className="mono v-prop-val v-prop-val--muted"><MinusIcon />—</span>
          )}
        </PropRow>

        <PropRow label="input">
          <span className="mono v-prop-val">{inputStr}</span>
        </PropRow>

        <PropRow label="nil uuid?" last>
          <span className="v-prop-val-row">
            <span className={`mono v-prop-val${result.isNil ? "" : " v-prop-val--muted"}`}>
              {result.isNil ? "true" : "false"}
            </span>
          </span>
        </PropRow>
      </div>
    </div>
  );
}

export default ValidatorPropsGrid;
