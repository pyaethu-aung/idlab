function DecodedFields({ decoded, variant }) {
  if (!decoded && !variant) return null;

  return (
    <div className="decoded-fields">
      {variant && (
        <div className="decoded-row">
          <span className="decoded-label">variant</span>
          <span className="decoded-value mono">{variant}</span>
        </div>
      )}
      {decoded && (
        <>
          <div className="decoded-row">
            <span className="decoded-label">timestamp</span>
            <span className="decoded-value decoded-timestamp-rel">{decoded.timestampRelative}</span>
          </div>
          <div className="decoded-row">
            <span className="decoded-label">ISO 8601</span>
            <span className="decoded-value mono">{decoded.timestampIso}</span>
          </div>
          {decoded.sequence !== null && decoded.sequence !== undefined && (
            <div className="decoded-row">
              <span className="decoded-label">sequence</span>
              <span className="decoded-value mono">{decoded.sequence}</span>
            </div>
          )}
          {decoded.node && (
            <div className="decoded-row">
              <span className="decoded-label">node</span>
              <span className="decoded-value mono">{decoded.node}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DecodedFields;
