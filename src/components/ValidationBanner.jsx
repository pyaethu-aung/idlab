const VERSION_DESC = {
  0:  "nil UUID — all zeros",
  1:  "time-based (Gregorian epoch, 100 ns ticks)",
  3:  "name-based (MD5 hash)",
  4:  "randomly generated",
  5:  "name-based (SHA-1 hash)",
  6:  "reordered time-based",
  7:  "time-ordered (Unix-ms + random)",
  15: "max UUID — all ones",
};

function ValidationBanner({ result }) {
  if (!result) return null;

  if (!result.valid) {
    return (
      <div className="v-banner v-banner--invalid" role="status">
        <div className="v-banner-icon v-banner-icon--invalid" aria-hidden="true">✕</div>
        <div className="v-banner-text">
          <span className="v-banner-line1 mono">Invalid UUID</span>
          <span className="v-banner-line2 mono">Input does not match RFC 4122 or any known UUID format.</span>
        </div>
      </div>
    );
  }

  const desc = VERSION_DESC[result.version] ?? `UUID version ${result.version}`;
  const confidence = result.isNil ? "nil" : "100%";

  return (
    <div className="v-banner v-banner--valid" role="status">
      <div className="v-banner-icon" aria-hidden="true">✓</div>
      <div className="v-banner-text">
        <span className="v-banner-line1 mono">
          Valid · UUID v{result.version} ({desc})
        </span>
        <span className="v-banner-line2 mono">
          All {result.charCount} characters match RFC 4122; variant {result.variantBits}.
        </span>
      </div>
      <div className="v-banner-score">
        <span className="v-banner-score-num mono">{confidence}</span>
        <span className="v-banner-score-lbl mono">confidence</span>
      </div>
    </div>
  );
}

export default ValidationBanner;
