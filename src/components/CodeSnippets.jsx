import highlightCode from "../utils/highlightCode";

// Render a snippet as syntax-coloured spans. The corpus is tiny, so tokenizing
// on each render is negligible; no memo needed.
function Highlighted({ code, lang }) {
  return highlightCode(code, lang).map((tok, idx) => (
    <span key={idx} className={`tok-${tok.type}`}>
      {tok.text}
    </span>
  ));
}

// Generator-side "Copy as code" panel: for the version selected in the rail,
// show how to produce it in each language. A header toggle switches between
// "inline" (the compact import + call one-liner) and "full" (the complete,
// copy-paste-runnable program). Both the displayed code and the copied text
// follow the toggle, so what you copy is always what you see.
//
// All view state lives in `useCodeSnippets` (passed in as `snippets`) so the
// same toggle/copy actions are driven by both these buttons and the keyboard
// map (⌥F flip, ⌥S copy). This component only renders.
function CodeSnippets({ version, snippets }) {
  const { rows, full, toggleFull, copiedLang, clipboardError, copy } = snippets;
  if (!rows) return null;

  return (
    <section className="panel snip-panel" aria-label="Copy as code">
      <header className="panel-head">
        <div className="panel-meta">
          <span className="panel-bar" aria-hidden="true" />
          <span className="panel-title mono">/ snippets · {version}</span>
        </div>
        <div className="snip-toggle" role="group" aria-label="Snippet detail">
          <button
            type="button"
            className={`mode-btn mono${full ? "" : " mode-btn--active"}`}
            aria-pressed={!full}
            onClick={() => full && toggleFull()}
          >
            inline
          </button>
          <button
            type="button"
            className={`mode-btn mono${full ? " mode-btn--active" : ""}`}
            aria-pressed={full}
            onClick={() => !full && toggleFull()}
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
                <pre className="cx-value mono snip-full">
                  <Highlighted code={snippet} lang={lang} />
                </pre>
              ) : (
                <code className="cx-value mono snip-code">
                  <Highlighted code={snippet} lang={lang} />
                </code>
              )}
              <button
                type="button"
                className={`cx-copy mono${copiedLang === lang ? " is-copied" : ""}`}
                onClick={() => copy(lang, snippet)}
                aria-label={copiedLang === lang ? "Copied" : `Copy ${lang} ${full ? "program" : "snippet"}`}
              >
                {copiedLang === lang ? "✓ copied" : "copy"}
              </button>
            </div>
          );
        })}
      </div>
      {clipboardError && (
        <p className="snip-clip-error mono" role="status">
          clipboard unavailable — select the code and copy manually
        </p>
      )}
    </section>
  );
}

export default CodeSnippets;
