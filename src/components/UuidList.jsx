import { useMemo, useState } from "react";

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15V5a1 1 0 0 1 1-1h10" strokeLinecap="round" />
    </svg>
  );
}

function DownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 4v5h5M20 20v-5h-5M5 9a7 7 0 0 1 12.1-4L19 7M19 15a7 7 0 0 1-12.1 4L5 17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UuidRow({ index, uuid, isCopied, onCopy }) {
  const [hover, setHover] = useState(false);
  const parts = uuid.includes("-") ? uuid.split("-") : [uuid];

  return (
    <div
      className={`row${isCopied ? " is-copied" : ""}${hover ? " is-hover" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onCopy}
    >
      <span className="row-idx mono">{String(index).padStart(3, "0")}</span>
      <code className="row-uuid mono">
        {parts.length > 1
          ? parts.map((p, i) => (
              <span key={i}>
                <span className={`uuid-seg seg-${i}`}>{p}</span>
                {i < parts.length - 1 && <span className="uuid-dash">-</span>}
              </span>
            ))
          : uuid}
      </code>
      <span className="row-len mono">{uuid.length}</span>
      <button
        type="button"
        className={`row-copy mono${isCopied ? " is-copied" : ""}`}
        onClick={(e) => { e.stopPropagation(); onCopy(); }}
        aria-label={isCopied ? "Copied" : "Copy UUID"}
      >
        {isCopied ? "✓ copied" : "copy"}
      </button>
    </div>
  );
}

const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");
const KEY_META = IS_MAC ? "⌘" : "Ctrl";

function UuidList({
  uuids,
  version,
  opts,
  copiedUuid,
  onCopy,
  onCopyAll,
  onRegen,
  onDownload,
  refreshing,
}) {
  const flagSummary = useMemo(() => {
    const f = [];
    if (opts.uppercase) f.push("UPPER");
    if (opts.trimHyphens) f.push("STRIP");
    if (opts.wrapBraces) f.push("BRACE");
    return f.length ? f.join(" · ") : "default";
  }, [opts]);

  return (
    <section className="panel">
      <header className="panel-head">
        <div className="panel-meta">
          <span className="panel-bar" aria-hidden="true" />
          <span className="panel-title mono">/ output · {uuids.length} rows</span>
          <span className="panel-sep">|</span>
          <span className="panel-flag mono">{version} · {flagSummary}</span>
        </div>
        <div className="panel-actions">
          <button type="button" className="ghost-btn mono" onClick={onCopyAll} aria-label="Copy all UUIDs">
            <CopyIcon /> <span>copy all</span>
          </button>
          <button type="button" className="ghost-btn mono" onClick={onDownload} aria-label="Download as .txt">
            <DownIcon /> <span>download .txt</span>
          </button>
          <button
            type="button"
            className="cta-btn mono"
            onClick={onRegen}
            aria-label="Regenerate"
            aria-busy={refreshing}
          >
            <span className={refreshing ? "spin" : ""} aria-hidden="true">
              <RefreshIcon />
            </span>
            regenerate
            <kbd className="cta-kbd">{KEY_META}↵</kbd>
          </button>
        </div>
      </header>

      <div className="panel-grid">
        {uuids.map((u, i) => (
          <UuidRow
            key={`${u}-${i}`}
            index={i + 1}
            uuid={u}
            isCopied={copiedUuid === u}
            onCopy={() => onCopy(u)}
          />
        ))}
      </div>
    </section>
  );
}

export default UuidList;
