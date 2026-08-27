import { versionLabel } from "../utils/uuidDecoder";

function StatusBar({
  activeTab,
  version, batch, visible, opts, feedback,
  validatorSummary, validatorExpanded, validatorCheckCount,
  ulidResult,
  nanoidStats, nanoidCount,
  ksuidResult,
  onShortcuts,
}) {
  if (activeTab === "validator") {
    return (
      <ValidatorStatusBar
        summary={validatorSummary}
        expanded={validatorExpanded}
        checkCount={validatorCheckCount}
        onShortcuts={onShortcuts}
      />
    );
  }

  if (activeTab === "ulid") {
    return <UlidStatusBar result={ulidResult} onShortcuts={onShortcuts} />;
  }

  if (activeTab === "nanoid") {
    return (
      <NanoIdStatusBar
        stats={nanoidStats}
        count={nanoidCount}
        onShortcuts={onShortcuts}
      />
    );
  }

  if (activeTab === "ksuid") {
    return <KsuidStatusBar result={ksuidResult} onShortcuts={onShortcuts} />;
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
      <span className="status-cell status-hide-sm">batch {String(batch).padStart(3, "0")}</span>
      <span className="status-cell status-hide-sm">visible {String(visible).padStart(2, "0")}</span>
      <span className="status-cell">
        flags [{flags.length ? flags.join(" ") : "none"}]
      </span>
      {/* The only confirmation that a copy or download happened. Shortcuts
          fire it without moving focus, so without a live region a screen
          reader user gets no feedback at all (WCAG 4.1.3). aria-atomic so
          the verb is read with its arrow, not as a bare fragment. */}
      <span
        className="status-cell status-feedback"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {feedback ? (
          <>
            <span className="status-arrow" aria-hidden="true">→</span>
            <span>{feedback}</span>
          </>
        ) : (
          <span className="status-quiet">ready</span>
        )}
      </span>
      <span className="status-spacer" />
      <button className="status-btn shortcut-trigger" onClick={onShortcuts}>
        press <kbd>?</kbd> for shortcuts
      </button>
    </footer>
  );
}

function ValidatorStatusBar({ summary, expanded, checkCount, onShortcuts }) {
  const hasRows = summary !== null && summary !== undefined;
  // The aggregate dot reads valid only when every row passed; any failure tints
  // it like the old single-UUID invalid state. With input present there is
  // always at least one row, so "no invalid" means "all valid".
  const okState = hasRows ? summary.invalid === 0 : null;

  // When a row is open, surface its specifics so the footer reflects the
  // selection the way the single inspector used to.
  const expVersion = expanded?.valid ? `${versionLabel(expanded)} selected` : null;
  const expTs = expanded?.valid && expanded.decoded
    ? `ts · ${expanded.decoded.timestampIso?.slice(0, 19).replace("T", " ")} UTC`
    : null;

  return (
    <footer className="status mono">
      {okState !== null && (
        <span className={`status-cell${okState ? " status-cell--valid" : " status-cell--invalid"}`}>
          <span className={`status-dot${okState ? "" : " status-dot--invalid"}`} />
          {okState ? "ALL VALID" : "HAS INVALID"}
        </span>
      )}
      {hasRows && <span className="status-cell">{summary.valid} valid</span>}
      {hasRows && <span className="status-cell">{summary.invalid} invalid</span>}
      {hasRows && <span className="status-cell status-hide-sm">{summary.total} total</span>}
      {expVersion && <span className="status-cell status-hide-sm">{expVersion}</span>}
      {expTs && <span className="status-cell status-hide-sm">{expTs}</span>}
      <span className="status-cell status-hide-sm">{checkCount} checks today</span>
      <span className="status-spacer" />
      <button className="status-btn shortcut-trigger" onClick={onShortcuts}>
        press <kbd>?</kbd> for shortcuts
      </button>
    </footer>
  );
}

function UlidStatusBar({ result, onShortcuts }) {
  const isValid = result?.valid ?? null;
  const kind = result?.valid ? result.kind.toUpperCase() : null;
  const tsLabel = result?.valid
    ? `ts · ${result.timestampIso.slice(0, 19).replace("T", " ")} UTC`
    : null;

  return (
    <footer className="status mono">
      {isValid !== null && (
        <span className={`status-cell${isValid ? " status-cell--valid" : " status-cell--invalid"}`}>
          <span className={`status-dot${isValid ? "" : " status-dot--invalid"}`} />
          {isValid ? "VALID" : "INVALID"}
        </span>
      )}
      {kind     && <span className="status-cell">{kind}</span>}
      {tsLabel  && <span className="status-cell status-hide-sm">{tsLabel}</span>}
      <span className="status-cell status-hide-sm">ulid · 26 chars</span>
      <span className="status-spacer" />
      <button className="status-btn shortcut-trigger" onClick={onShortcuts}>
        press <kbd>?</kbd> for shortcuts
      </button>
    </footer>
  );
}

function KsuidStatusBar({ result, onShortcuts }) {
  const isValid = result?.valid ?? null;
  const tsLabel = result?.valid
    ? `ts · ${result.timestampIso.slice(0, 19).replace("T", " ")} UTC`
    : null;

  return (
    <footer className="status mono">
      {isValid !== null && (
        <span className={`status-cell${isValid ? " status-cell--valid" : " status-cell--invalid"}`}>
          <span className={`status-dot${isValid ? "" : " status-dot--invalid"}`} />
          {isValid ? "VALID" : "INVALID"}
        </span>
      )}
      {tsLabel && <span className="status-cell status-hide-sm">{tsLabel}</span>}
      <span className="status-cell status-hide-sm">ksuid · 27 chars</span>
      <span className="status-spacer" />
      <button className="status-btn shortcut-trigger" onClick={onShortcuts}>
        press <kbd>?</kbd> for shortcuts
      </button>
    </footer>
  );
}

function NanoIdStatusBar({ stats, count, onShortcuts }) {
  return (
    <footer className="status mono">
      <span className="status-cell">
        <span className="status-dot" />
        live
      </span>
      <span className="status-cell">{stats.alphabetSize} symbols</span>
      <span className="status-cell">{stats.bits.toFixed(1)} bits</span>
      <span className="status-cell status-hide-sm">batch {String(count).padStart(2, "0")}</span>
      <span className="status-spacer" />
      <button className="status-btn shortcut-trigger" onClick={onShortcuts}>
        press <kbd>?</kbd> for shortcuts
      </button>
    </footer>
  );
}

export default StatusBar;
