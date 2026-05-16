function StatusBar({
  activeTab,
  version, batch, visible, opts, feedback,
  validatorResult, validatorCheckCount,
  onShortcuts,
}) {
  if (activeTab === "validator") {
    return (
      <ValidatorStatusBar
        result={validatorResult}
        checkCount={validatorCheckCount}
        onShortcuts={onShortcuts}
      />
    );
  }

  const flags = [];
  if (opts.uppercase) flags.push("UPPER");
  if (opts.trimHyphens) flags.push("STRIP");
  if (opts.wrapBraces) flags.push("BRACE");

  return (
    <footer className="status mono">
      <span className="status-cell">
        <span className="status-dot" />
        live
      </span>
      <span className="status-cell">ver {version}</span>
      <span className="status-cell">batch {String(batch).padStart(3, "0")}</span>
      <span className="status-cell">visible {String(visible).padStart(2, "0")}</span>
      <span className="status-cell">
        flags [{flags.length ? flags.join(" ") : "none"}]
      </span>
      <span className="status-cell status-feedback">
        {feedback ? (
          <>
            <span className="status-arrow">→</span>
            <span>{feedback}</span>
          </>
        ) : (
          <span className="status-quiet">ready</span>
        )}
      </span>
      <span className="status-spacer" />
      <button className="status-btn" onClick={onShortcuts}>
        press <kbd>?</kbd> for shortcuts
      </button>
    </footer>
  );
}

function ValidatorStatusBar({ result, checkCount, onShortcuts }) {
  const isValid = result?.valid ?? null;
  const version = result?.valid ? `v${result.version} detected` : null;
  const variant = result?.valid ? result.variantBits.split(" · b")[0] : null;
  const charCount = result?.valid ? `${result.charCount} chars` : null;
  const tsLabel = result?.valid && result.decoded
    ? `ts · ${result.decoded.timestampIso?.slice(0, 19).replace("T", " ")} UTC`
    : null;

  return (
    <footer className="status mono">
      {isValid !== null && (
        <span className={`status-cell${isValid ? " status-cell--valid" : " status-cell--invalid"}`}>
          <span className={`status-dot${isValid ? "" : " status-dot--invalid"}`} />
          {isValid ? "VALID" : "INVALID"}
        </span>
      )}
      {version  && <span className="status-cell">{version}</span>}
      {variant  && <span className="status-cell">{variant}</span>}
      {tsLabel  && <span className="status-cell">{tsLabel}</span>}
      {charCount && <span className="status-cell">{charCount}</span>}
      <span className="status-cell">{checkCount} checks today</span>
      <span className="status-spacer" />
      <button className="status-btn" onClick={onShortcuts}>
        press <kbd>?</kbd> for shortcuts
      </button>
    </footer>
  );
}

export default StatusBar;
