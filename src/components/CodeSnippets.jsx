import { useState } from "react";
import { snippetsFor } from "../data/codeSnippets";

// Generator-side "Copy as code" panel: for the version selected in the rail,
// show how to produce it in each language. A header toggle switches between
// "inline" (the compact import + call one-liner) and "full" (the complete,
// copy-paste-runnable program). Both the displayed code and the copied text
// follow the toggle, so what you copy is always what you see. Copy feedback
// and the toggle are transient view state, so they live here rather than in a
// hook (no business logic to own).
function CodeSnippets({ version }) {
  const [copiedLang, setCopiedLang] = useState(null);
  const [full, setFull] = useState(false);
  const rows = snippetsFor(version);
  if (!rows) return null;

  const copy = (lang, code) => {
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedLang(lang);
      setTimeout(() => setCopiedLang(null), 1500);
    });
  };

  return (
    <section className="panel snip-panel" aria-label="Copy as code">
      <header className="panel-head">
        <div className="panel-meta">
          <span className="panel-bar" aria-hidden="true" />
          <span className="panel-title mono">/ snippets · {version}</span>
          <span className="panel-sep">|</span>
          <span className="panel-flag mono">copy as code</span>
        </div>
        <div className="snip-toggle" role="group" aria-label="Snippet detail">
          <button
            type="button"
            className={`mode-btn mono${full ? "" : " mode-btn--active"}`}
            aria-pressed={!full}
            onClick={() => setFull(false)}
          >
            inline
          </button>
          <button
            type="button"
            className={`mode-btn mono${full ? " mode-btn--active" : ""}`}
            aria-pressed={full}
            onClick={() => setFull(true)}
          >
            full
          </button>
        </div>
      </header>
      <div
        className="cx-rows"
        role="list"
        aria-label={`${version} generator ${full ? "programs" : "one-liners"}`}
      >
        {rows.map(({ lang, code, full: fullCode }) => {
          const snippet = full ? fullCode : code;
          return (
            <div key={lang} className={`cx-row${full ? " snip-row--full" : ""}`} role="listitem">
              <span className="cx-label mono">{lang}</span>
              {full ? (
                <pre className="cx-value mono snip-full">{snippet}</pre>
              ) : (
                <code className="cx-value mono snip-code">{snippet}</code>
              )}
              <button
                type="button"
                className={`cx-copy mono${copiedLang === lang ? " is-copied" : ""}`}
                onClick={() => copy(lang, snippet)}
                aria-label={copiedLang === lang ? "Copied" : `Copy ${lang} snippet`}
              >
                {copiedLang === lang ? "✓ copied" : "copy"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CodeSnippets;
