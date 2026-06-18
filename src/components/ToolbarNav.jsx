const TABS = [
  { id: "generator", label: "Generator" },
  { id: "validator", label: "Validator" },
  { id: "converter", label: "Converter" },
  { id: "bulk", label: "Bulk" },
];

function ToolbarNav({ activeTab, onTabChange }) {
  return (
    <>
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`tab-btn${activeTab === id ? " tab-btn--active" : ""}`}
          aria-current={activeTab === id ? "page" : undefined}
          onClick={() => activeTab !== id && onTabChange(id)}
        >
          {label}
        </button>
      ))}
    </>
  );
}

export default ToolbarNav;
