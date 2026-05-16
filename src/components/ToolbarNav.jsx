function ToolbarNav({ activeTab, onTabChange }) {
  return (
    <>
      <button
        type="button"
        className={`tab-btn${activeTab === "generator" ? " tab-btn--active" : ""}`}
        aria-current={activeTab === "generator" ? "page" : undefined}
        onClick={() => activeTab !== "generator" && onTabChange("generator")}
      >
        Generator
      </button>
      <button
        type="button"
        className={`tab-btn${activeTab === "validator" ? " tab-btn--active" : ""}`}
        aria-current={activeTab === "validator" ? "page" : undefined}
        onClick={() => activeTab !== "validator" && onTabChange("validator")}
      >
        Validator
      </button>
    </>
  );
}

export default ToolbarNav;
