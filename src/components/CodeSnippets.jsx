import { useState } from "react";
import { snippetsFor } from "../data/codeSnippets";

// Generator-side "Copy as code" panel: for the version selected in the rail,
// list the one-liner that produces it in each language. Reuses the converter's
// cx-row label|value|copy layout. Copy feedback is transient view state, so it
// lives here rather than in a hook (no business logic to own).
function CodeSnippets({ version }) {
  const [copiedLang, setCopiedLang] = useState(null);
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
      </header>
      <div className="cx-rows" role="list" aria-label={`${version} generator one-liners`}>
        {rows.map(({ lang, code }) => (
          <div key={lang} className="cx-row" role="listitem">
            <span className="cx-label mono">{lang}</span>
            <code className="cx-value mono snip-code">{code}</code>
            <button
              type="button"
              className={`cx-copy mono${copiedLang === lang ? " is-copied" : ""}`}
              onClick={() => copy(lang, code)}
              aria-label={copiedLang === lang ? "Copied" : `Copy ${lang} snippet`}
            >
              {copiedLang === lang ? "✓ copied" : "copy"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CodeSnippets;
