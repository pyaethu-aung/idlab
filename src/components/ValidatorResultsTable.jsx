import { Fragment } from "react";
import ValidationBanner from "./ValidationBanner";
import ValidatorConvert from "./ValidatorConvert";
import ValidatorPropsGrid from "./ValidatorPropsGrid";
import ValidatorSegCard from "./ValidatorSegCard";
import { versionLabel } from "../utils/uuidDecoder";

function StatusCell({ result, mismatch }) {
  if (result.valid && !mismatch) {
    return (
      <span className="bulk-status bulk-status--ok">
        <span className="bulk-status-pip" aria-hidden="true">✓</span>
        <span className="mono">valid</span>
      </span>
    );
  }
  if (result.valid && mismatch) {
    return (
      <span className="bulk-status bulk-status--warn" title={`wrong version: is ${versionLabel(result)}`}>
        <span className="bulk-status-pip" aria-hidden="true">≠</span>
        <span className="mono bulk-status-reason">≠ {versionLabel(result)}</span>
      </span>
    );
  }
  return (
    <span className="bulk-status bulk-status--bad" title={result.reason}>
      <span className="bulk-status-pip" aria-hidden="true">✗</span>
      <span className="mono bulk-status-reason">{result.reason}</span>
    </span>
  );
}

function VersionCell({ result }) {
  if (!result.valid) return <span className="mono bulk-muted">—</span>;
  return <span className="bulk-ver-pill mono">{versionLabel(result)}</span>;
}

function TimeCell({ result }) {
  if (!result.valid || !result.decoded) {
    return <span className="mono bulk-muted">—</span>;
  }
  const { decoded } = result;
  return (
    <span className="bulk-time">
      <span className="mono bulk-time-iso">
        {decoded.timestampIso.slice(0, 19).replace("T", " ")} UTC
      </span>
      <span className="mono bulk-time-rel">{decoded.timestampRelative}</span>
    </span>
  );
}

// The expanded detail reuses the single-UUID inspector components verbatim: each
// self-hides the parts that do not apply (an invalid row shows just the banner).
function RowDetail({ result, conversion, conversionCopied, onCopyConversion, copyOne, copiedLine, line }) {
  return (
    <div className="v-row-detail-inner">
      <div className="v-result-section">
        <ValidationBanner result={result} />
        <ValidatorSegCard fields={result.valid ? result.fields : null} />
      </div>
      {result.valid && <ValidatorPropsGrid result={result} />}
      <ValidatorConvert
        conversion={conversion}
        copied={conversionCopied}
        onCopy={onCopyConversion}
      />
      {result.valid && (
        <div className="v-row-detail-actions">
          <button
            type="button"
            className={`v-input-btn v-input-btn--secondary mono${copiedLine === line ? " is-copied" : ""}`}
            onClick={() => copyOne(line, result.raw)}
            aria-label="Copy this UUID"
          >
            {copiedLine === line ? "✓ copied" : "copy uuid"}
          </button>
        </div>
      )}
    </div>
  );
}

function ValidatorResultsTable({
  rows,
  expandedLine,
  onToggleRow,
  conversion,
  conversionCopied,
  onCopyConversion,
  copyOne,
  copiedLine,
  assertVersion,
}) {
  return (
    <div className="bulk-table-wrap">
      <table className="bulk-table v-results-table">
        <thead>
          <tr>
            <th scope="col" className="mono bulk-col-num">#</th>
            <th scope="col" className="mono bulk-col-uuid">uuid</th>
            <th scope="col" className="mono bulk-col-status">status</th>
            <th scope="col" className="mono bulk-col-ver">version</th>
            <th scope="col" className="mono bulk-col-variant">variant</th>
            <th scope="col" className="mono bulk-col-time">time</th>
            <th scope="col" className="v-col-expand">
              <span className="sr-only">details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isOpen = row.line === expandedLine;
            const mismatch = assertVersion
              ? row.result.valid && versionLabel(row.result) !== assertVersion
              : false;
            const rowMod = !row.result.valid
              ? " bulk-row--invalid"
              : mismatch
              ? " bulk-row--mismatch"
              : "";
            return (
              <Fragment key={`${row.line}-${row.input}`}>
                <tr className={`bulk-row${rowMod}${isOpen ? " v-row--open" : ""}`}>
                  <td className="mono bulk-col-num">{row.line}</td>
                  <td className="mono bulk-col-uuid">
                    <code className="bulk-uuid">{row.input}</code>
                  </td>
                  <td className="bulk-col-status">
                    <StatusCell result={row.result} mismatch={mismatch} />
                  </td>
                  <td className="bulk-col-ver">
                    <VersionCell result={row.result} />
                  </td>
                  <td className="mono bulk-col-variant">
                    {row.result.valid ? (
                      row.result.variant
                    ) : (
                      <span className="bulk-muted">—</span>
                    )}
                  </td>
                  <td className="bulk-col-time">
                    <TimeCell result={row.result} />
                  </td>
                  <td className="v-col-expand">
                    <button
                      type="button"
                      className="v-row-toggle"
                      onClick={() => onToggleRow(row.line)}
                      aria-expanded={isOpen}
                      aria-label={
                        isOpen
                          ? `Collapse details for line ${row.line}`
                          : `Expand details for line ${row.line}`
                      }
                    >
                      <span className={`v-row-chev${isOpen ? " v-row-chev--open" : ""}`} aria-hidden="true">
                        ›
                      </span>
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="v-row-detail-row">
                    <td colSpan={7} className="v-row-detail">
                      <RowDetail
                        result={row.result}
                        conversion={conversion}
                        conversionCopied={conversionCopied}
                        onCopyConversion={onCopyConversion}
                        copyOne={copyOne}
                        copiedLine={copiedLine}
                        line={row.line}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ValidatorResultsTable;
