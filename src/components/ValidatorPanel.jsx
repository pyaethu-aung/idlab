import ValidatorRail from "./ValidatorRail";
import ValidatorResultsTable from "./ValidatorResultsTable";

function ValidatorPanel({ validator }) {
  const {
    rawInput,
    setRawInput,
    options,
    toggleOption,
    parsed,
    summary,
    validCount,
    expandedLine,
    toggleRow,
    conversion,
    conversionCopied,
    copyConversion,
    copyValid,
    copiedAll,
    copyOne,
    copiedLine,
    clearInput,
    loadSample,
    loadSampleList,
    activeSample,
    assertVersion,
    setAssertVersion,
    assertSummary,
    tableFilter,
    setTableFilter,
    filteredRows,
  } = validator;

  const copyCount = assertVersion ? (assertSummary?.pass ?? 0) : validCount;
  const copyLabel = assertVersion ? "matching" : "valid";

  return (
    <section className="validator-panel">
      <div className="v-workbench">
        <ValidatorRail
          value={rawInput}
          onChange={setRawInput}
          options={options}
          onToggleOption={toggleOption}
          onClear={clearInput}
          onLoadSample={loadSample}
          onLoadSampleList={loadSampleList}
          activeSample={activeSample}
          assertVersion={assertVersion}
          onSetAssertVersion={setAssertVersion}
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
                    {assertSummary && (
                      <>
                        <span className="bulk-count bulk-count--ok mono">
                          <span className="bulk-count-num">{assertSummary.pass}</span> pass
                        </span>
                        <span className="bulk-count bulk-count--warn-val mono">
                          <span className="bulk-count-num">{assertSummary.fail}</span> fail
                        </span>
                      </>
                    )}
                    {summary.truncated && (
                      <span className="bulk-count bulk-count--warn mono">
                        capped at 1000
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`v-input-btn v-input-btn--secondary bulk-copy-btn mono${copiedAll ? " is-copied" : ""}`}
                    onClick={copyValid}
                    disabled={copyCount === 0}
                    aria-label={`Copy all ${copyLabel} UUIDs`}
                  >
                    {copiedAll ? "✓ copied" : `copy ${copyCount} ${copyLabel}`}
                  </button>
                </div>
                {assertVersion && summary.total > 0 && (
                  <div className="v-filter-tabs" role="radiogroup" aria-label="Filter results">
                    {["all", "pass", "fail"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        role="radio"
                        className={`v-filter-tab mono${tableFilter === f ? " v-filter-tab--active" : ""}`}
                        onClick={() => setTableFilter(f)}
                        aria-checked={tableFilter === f}
                      >
                        {f === "pass"
                          ? `pass (${assertSummary?.pass ?? 0})`
                          : f === "fail"
                          ? `fail (${assertSummary?.fail ?? 0})`
                          : "all"}
                      </button>
                    ))}
                  </div>
                )}
                <ValidatorResultsTable
                  rows={filteredRows}
                  expandedLine={expandedLine}
                  onToggleRow={toggleRow}
                  conversion={conversion}
                  conversionCopied={conversionCopied}
                  onCopyConversion={copyConversion}
                  copyOne={copyOne}
                  copiedLine={copiedLine}
                  assertVersion={assertVersion}
                />
              </>
            ) : (
              <div className="v-empty-state">
                <span className="v-empty-msg mono">paste one or more uuids to validate</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValidatorPanel;
