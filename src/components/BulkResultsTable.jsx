function StatusCell({ result }) {
  if (result.valid) {
    return (
      <span className="bulk-status bulk-status--ok">
        <span className="bulk-status-pip" aria-hidden="true">✓</span>
        <span className="mono">valid</span>
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
  const label = result.isNil ? "nil" : result.version === 15 ? "max" : `v${result.version}`;
  return <span className="bulk-ver-pill mono">{label}</span>;
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

function BulkResultsTable({ rows }) {
  return (
    <div className="bulk-table-wrap">
      <table className="bulk-table">
        <thead>
          <tr>
            <th scope="col" className="mono bulk-col-num">#</th>
            <th scope="col" className="mono bulk-col-uuid">uuid</th>
            <th scope="col" className="mono bulk-col-status">status</th>
            <th scope="col" className="mono bulk-col-ver">version</th>
            <th scope="col" className="mono bulk-col-variant">variant</th>
            <th scope="col" className="mono bulk-col-time">time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.line}-${row.input}`}
              className={`bulk-row${row.result.valid ? "" : " bulk-row--invalid"}`}
            >
              <td className="mono bulk-col-num">{row.line}</td>
              <td className="mono bulk-col-uuid">
                <code className="bulk-uuid">{row.input}</code>
              </td>
              <td className="bulk-col-status">
                <StatusCell result={row.result} />
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BulkResultsTable;
