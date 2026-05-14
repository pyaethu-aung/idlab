import ValidationBanner from "./ValidationBanner";
import ValidatorPanelHead from "./ValidatorPanelHead";
import ValidatorPropsGrid from "./ValidatorPropsGrid";
import ValidatorRail from "./ValidatorRail";
import ValidatorSegCard from "./ValidatorSegCard";

function ValidatorPanel({ validator }) {
  const {
    rawInput,
    setRawInput,
    result,
    options,
    toggleOption,
    loadSample,
    activeSample,
  } = validator;

  return (
    <section className="validator-panel">
      <div className="validator-hero">
        <h1 className="validator-hero__headline">
          Decode any <span className="accent-text">UUID</span>
          <br />
          <span className="validator-hero__sub-line">at a glance.</span>
        </h1>
        <p className="validator-hero__sub">
          Paste a UUID and instantly know if it&rsquo;s valid, which RFC 4122
          version it represents, and what the embedded timestamp means for v1
          and v7 identifiers.
        </p>
      </div>

      <div className="v-workbench">
        <ValidatorRail
          value={rawInput}
          onChange={setRawInput}
          options={options}
          onToggleOption={toggleOption}
          onLoadSample={loadSample}
          activeSample={activeSample}
        />

        <div className="v-panel-view">
          <ValidatorPanelHead result={result} />
          <div className="v-panel-body">
            {result && (
              <>
                <div className="v-result-section">
                  <ValidationBanner result={result} />
                  <ValidatorSegCard fields={result?.valid ? result.fields : null} />
                </div>
                {result.valid && (
                  <ValidatorPropsGrid result={result} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValidatorPanel;
