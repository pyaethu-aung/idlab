import useUuidValidator from "../hooks/useUuidValidator";
import DecodedFields from "./DecodedFields";
import UuidBreakdown from "./UuidBreakdown";
import UuidInput from "./UuidInput";
import ValidationBadge from "./ValidationBadge";

function ValidatorPanel() {
  const { rawInput, setRawInput, result } = useUuidValidator();

  return (
    <section className="validator-panel">
      <div className="validator-hero">
        <h1 className="validator-hero__headline">
          Decode any <span className="accent-text">UUID</span>
          <br />
          at a glance.
        </h1>
        <p className="validator-hero__sub">
          Paste a UUID and instantly know if it&rsquo;s valid, which RFC 4122
          version it represents, and what the embedded timestamp means for v1
          and v7 identifiers.
        </p>
      </div>

      <div className="validator-workbench">
        <UuidInput value={rawInput} onChange={setRawInput} />
        <ValidationBadge result={result} />
        <UuidBreakdown fields={result?.valid ? result.fields : null} />
        <DecodedFields
          decoded={result?.decoded ?? null}
          variant={result?.valid ? result.variant : null}
        />
      </div>
    </section>
  );
}

export default ValidatorPanel;
