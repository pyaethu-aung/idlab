const SEGMENTS = [
  { key: "timeLow",             cap: "time_high",    type: "default" },
  { key: "timeMid",             cap: "time_mid",     type: "default" },
  { key: "timeHighAndVersion",  cap: "version + rand", type: "version" },
  { key: "clockSeqAndReserved", cap: "variant + clk",  type: "variant" },
  { key: "node",                cap: "node / random",  type: "default" },
];

function ValidatorSegCard({ fields }) {
  if (!fields) return null;

  return (
    <div className="v-seg-card">
      <div className="v-seg-card-head">
        <span className="v-rail-key mono">parsed structure</span>
        <span className="v-rail-hint mono">hover for byte offsets</span>
      </div>
      <div className="v-seg-row" aria-label="UUID field breakdown">
        {SEGMENTS.map((seg, i) => (
          <span key={seg.key} className="v-seg-item">
            {i > 0 && <span className="v-seg-dash mono" aria-hidden="true">–</span>}
            <div
              className={`v-seg v-seg--${seg.type}`}
              title={seg.cap}
            >
              <span className="v-seg-val mono">{fields[seg.key]}</span>
              <span className={`v-seg-cap mono${seg.type === "version" ? " v-seg-cap--on-accent" : ""}`}>
                {seg.cap}
              </span>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}

export default ValidatorSegCard;
