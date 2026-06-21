import { KEY_OPT } from "../utils/platform";

const TABS = [
  { id: "generator", label: "Generator" },
  { id: "validator", label: "Validator" },
  { id: "converter", label: "Converter" },
  { id: "ulid", label: "ULID" },
  { id: "nanoid", label: "NanoID" },
];

function ToolbarNav({ activeTab, onTabChange }) {
  return (
    <>
      {TABS.map(({ id, label }, i) => (
        // Keep the topbar uncluttered: surface the jump key via tooltip and
        // aria-keyshortcuts rather than a visible glyph under each tab.
        <button
          key={id}
          type="button"
          className={`tab-btn${activeTab === id ? " tab-btn--active" : ""}`}
          aria-current={activeTab === id ? "page" : undefined}
          aria-keyshortcuts={`Alt+Shift+${i + 1}`}
          title={`${label} · ${KEY_OPT}⇧${i + 1}`}
          onClick={() => activeTab !== id && onTabChange(id)}
        >
          {label}
        </button>
      ))}
    </>
  );
}

export default ToolbarNav;
