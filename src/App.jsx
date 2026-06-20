import { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import Hero from "./components/Hero";
import ShortcutReference from "./components/ShortcutReference";
import StatusBar from "./components/StatusBar";
import ThemeToggle from "./components/ThemeToggle";
import ToolbarNav from "./components/ToolbarNav";
import UuidList from "./components/UuidList";
import ConvertPanel from "./components/ConvertPanel";
import BulkPanel from "./components/BulkPanel";
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
import useUuidBulk from "./hooks/useUuidBulk";
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
    downloadList,
    commitBatchSize,
  } = useUuidGenerator();

  const validator = useUuidValidator();
  const converter = useUuidConverter();
  const bulk = useUuidBulk();
  const ulid = useUlid();
  const nanoid = useNanoId();

  useKeyboardShortcuts({
    batchSize,
    formattedUuids,
    isShortcutHelpOpen,
    setShortcutHelpOpen,
    regenerate,
    downloadList,
    handleVersionChange,
    toggleOption,
    setBatchSizeAndCommit,
    handleCopy,
  });

  return (
    <div className="root">
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
            className="ghost-btn mono"
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

        <div style={{ display: activeTab === "bulk" ? "" : "none" }}>
          <BulkPanel bulk={bulk} />
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
        validatorResult={validator.result}
        validatorCheckCount={validator.checkCount}
        ulidResult={ulid.result}
        nanoidStats={nanoid.stats}
        nanoidCount={nanoid.ids.length}
        onShortcuts={() => setShortcutHelpOpen(true)}
      />

      <ShortcutReference
        isOpen={isShortcutHelpOpen}
        shortcuts={SHORTCUTS}
        onClose={() => setShortcutHelpOpen(false)}
      />
    </div>
  );
}

export default App;
