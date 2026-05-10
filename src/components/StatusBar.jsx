function StatusBar({ version, batch, visible, opts, feedback, onShortcuts }) {
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

export default StatusBar;
