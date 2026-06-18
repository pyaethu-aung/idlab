import BulkRail from "./BulkRail";
import BulkResultsTable from "./BulkResultsTable";

function BulkPanel({ bulk }) {
  const {
    rawInput,
    setRawInput,
    options,
    toggleOption,
    parsed,
    validCount,
    clearInput,
    loadSample,
    copyValid,
    copied,
  } = bulk;

  const summary = parsed?.summary;

  return (
    <section className="validator-panel">
      <div className="v-workbench">
        <BulkRail
          value={rawInput}
          onChange={setRawInput}
          options={options}
          onToggleOption={toggleOption}
          onClear={clearInput}
          onLoadSample={loadSample}
        />

        <div className="v-panel-view">
          <div className="v-panel-body">
            {parsed ? (
              <>
                <div className="bulk-summary">
                  <div className="bulk-summary-counts">
                    <span className="bulk-count bulk-count--ok mono">
                      <span className="bulk-count-num">{summary.valid}</span> valid
                    </span>
                    <span className="bulk-count bulk-count--bad mono">
                      <span className="bulk-count-num">{summary.invalid}</span> invalid
                    </span>
                    <span className="bulk-count bulk-count--total mono">
                      <span className="bulk-count-num">{summary.total}</span> total
                    </span>
                    {summary.truncated && (
                      <span className="bulk-count bulk-count--warn mono">
                        capped at 1000
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`v-input-btn v-input-btn--secondary bulk-copy-btn mono${copied ? " is-copied" : ""}`}
                    onClick={copyValid}
                    disabled={validCount === 0}
                    aria-label="Copy all valid UUIDs"
                  >
                    {copied ? "✓ copied" : `copy ${validCount} valid`}
                  </button>
                </div>
                <BulkResultsTable rows={parsed.rows} />
              </>
            ) : (
              <div className="v-empty-state">
                <span className="v-empty-msg mono">
                  paste uuids to validate in bulk
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BulkPanel;
