import ValidationBanner from "./ValidationBanner";
import ValidatorConvert from "./ValidatorConvert";
import ValidatorPropsGrid from "./ValidatorPropsGrid";
import ValidatorRail from "./ValidatorRail";
import ValidatorSegCard from "./ValidatorSegCard";

function ValidatorPanel({ validator }) {
  const {
    rawInput,
    setRawInput,
    result,
    conversion,
    copyConversion,
    conversionCopied,
    options,
    toggleOption,
    loadSample,
    activeSample,
  } = validator;

  return (
    <section className="validator-panel">
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
          <div className="v-panel-body">
            {result ? (
              <>
                <div className="v-result-section">
                  <ValidationBanner result={result} />
                  <ValidatorSegCard fields={result?.valid ? result.fields : null} />
                </div>
                {result.valid && (
                  <ValidatorPropsGrid result={result} />
                )}
                <ValidatorConvert
                  conversion={conversion}
                  copied={conversionCopied}
                  onCopy={copyConversion}
                />
              </>
            ) : (
              <div className="v-empty-state">
                <span className="v-empty-msg mono">paste a UUID to inspect</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValidatorPanel;
