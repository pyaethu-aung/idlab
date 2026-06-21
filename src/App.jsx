import { useMemo, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import Hero from "./components/Hero";
import ShortcutReference from "./components/ShortcutReference";
import StatusBar from "./components/StatusBar";
import TabAnnouncer from "./components/TabAnnouncer";
import ThemeToggle from "./components/ThemeToggle";
import ToolbarNav from "./components/ToolbarNav";
import UuidList from "./components/UuidList";
import ConvertPanel from "./components/ConvertPanel";
import ValidatorPanel from "./components/ValidatorPanel";
import UlidPanel from "./components/UlidPanel";
import NanoIdPanel from "./components/NanoIdPanel";
import SHORTCUTS from "./data/shortcuts";
import useActiveTab from "./hooks/useActiveTab";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useTheme from "./hooks/useTheme";
import useBrowserThemeSync from "./hooks/useBrowserThemeSync";
import useUuidGenerator from "./hooks/useUuidGenerator";
import useUuidConverter from "./hooks/useUuidConverter";
import useUuidValidator from "./hooks/useUuidValidator";
import useUlid from "./hooks/useUlid";
import useNanoId from "./hooks/useNanoId";

function BrandIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="9" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

function App() {
  const { activeTab, setActiveTab } = useActiveTab();
  const { theme, toggleTheme } = useTheme();
  useBrowserThemeSync(theme);
  const [isShortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const {
    batchSize,
    setBatchSize,
    setBatchSizeAndCommit,
    visibleBatchSize,
    selectedVersion,
    isNameBased,
    isFixed,
    isTimeBased,
    namespace,
    name,
    timestampMode,
    pinnedTime,
    pinnedMsecs,
    options,
    formattedUuids,
    copiedUuid,
    feedback,
    isRefreshing,
    regenerate,
    handleCopy,
    copyAll,
    handleVersionChange,
    handleNamespaceChange,
    handleNameChange,
    handleTimestampModeChange,
    handleTimestampChange,
    toggleOption,
    exportFormat,
    setExportFormat,
    cycleExportFormat,
    downloadList,
    commitBatchSize,
  } = useUuidGenerator();

  const validator = useUuidValidator();
  const converter = useUuidConverter();
  const ulid = useUlid();
  const nanoid = useNanoId();

  // One keyboard model across screens: the same verb key dispatches to the
  // active tab's action. A missing slot makes the verb a no-op on that tab.
  const tabActions = useMemo(
    () => ({
      generator: { generate: regenerate, copyAll, clear: null },
      validator: { generate: null, copyAll: null, clear: validator.clearInput },
      converter: { generate: null, copyAll: null, clear: converter.clearInput },
      ulid: { generate: ulid.generate, copyAll: null, clear: ulid.clearInput },
      nanoid: { generate: nanoid.regenerate, copyAll: nanoid.copyAll, clear: null },
    }),
    [
      regenerate,
      copyAll,
      validator.clearInput,
      converter.clearInput,
      ulid.generate,
      ulid.clearInput,
      nanoid.regenerate,
      nanoid.copyAll,
    ]
  );

  useKeyboardShortcuts({
    activeTab,
    batchSize,
    formattedUuids,
    isShortcutHelpOpen,
    setShortcutHelpOpen,
    downloadList,
    handleVersionChange,
    toggleOption,
    toggleValidatorOption: validator.toggleOption,
    setBatchSizeAndCommit,
    handleCopy,
    cycleExportFormat,
    setActiveTab,
    tabActions,
  });

  return (
    <div className="root">
      <TabAnnouncer activeTab={activeTab} />
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <BrandIcon />
          </span>
          <span className="brand-name">uuidlab</span>
        </div>
        <nav className="topbar-nav mono" aria-label="Tabs">
          <ToolbarNav activeTab={activeTab} onTabChange={setActiveTab} />
        </nav>
        <div className="topbar-right">
          <button
            type="button"
            className="ghost-btn mono shortcut-trigger"
            onClick={() => setShortcutHelpOpen(true)}
            aria-label="Open keyboard shortcuts"
          >
            <kbd>?</kbd> shortcuts
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="main">
        <div style={{ display: activeTab === "generator" ? "" : "none" }}>
          <Hero />

          <section className="bench">
            <ControlPanel
              batchSize={batchSize}
              visibleBatchSize={visibleBatchSize}
              selectedVersion={selectedVersion}
              isNameBased={isNameBased}
              isFixed={isFixed}
              isTimeBased={isTimeBased}
              namespace={namespace}
              name={name}
              timestampMode={timestampMode}
              pinnedTime={pinnedTime}
              pinnedMsecs={pinnedMsecs}
              options={options}
              onBatchChange={setBatchSize}
              onBatchCommit={commitBatchSize}
              onVersionChange={handleVersionChange}
              onNamespaceChange={handleNamespaceChange}
              onNameChange={handleNameChange}
              onTimestampModeChange={handleTimestampModeChange}
              onTimestampChange={handleTimestampChange}
              onToggleOption={toggleOption}
            />

            <UuidList
              uuids={formattedUuids}
              version={selectedVersion}
              batch={batchSize}
              opts={options}
              isFixed={isFixed}
              exportFormat={exportFormat}
              copiedUuid={copiedUuid}
              onCopy={handleCopy}
              onCopyAll={copyAll}
              onExportFormatChange={setExportFormat}
              onRegen={regenerate}
              onDownload={downloadList}
              refreshing={isRefreshing}
            />
          </section>
        </div>

        <div style={{ display: activeTab === "validator" ? "" : "none" }}>
          <ValidatorPanel validator={validator} />
        </div>

        <div style={{ display: activeTab === "converter" ? "" : "none" }}>
          <ConvertPanel converter={converter} />
        </div>

        <div style={{ display: activeTab === "ulid" ? "" : "none" }}>
          <UlidPanel ulid={ulid} />
        </div>

        <div style={{ display: activeTab === "nanoid" ? "" : "none" }}>
          <NanoIdPanel nanoid={nanoid} />
        </div>
      </main>

      <StatusBar
        activeTab={activeTab}
        version={selectedVersion}
        batch={batchSize}
        visible={visibleBatchSize}
        opts={options}
        feedback={feedback}
        validatorSummary={validator.summary}
        validatorExpanded={validator.expandedResult}
        validatorCheckCount={validator.checkCount}
        ulidResult={ulid.result}
        nanoidStats={nanoid.stats}
        nanoidCount={nanoid.ids.length}
        onShortcuts={() => setShortcutHelpOpen(true)}
      />

      <ShortcutReference
        isOpen={isShortcutHelpOpen}
        shortcuts={SHORTCUTS}
        activeTab={activeTab}
        onClose={() => setShortcutHelpOpen(false)}
      />
    </div>
  );
}

export default App;
