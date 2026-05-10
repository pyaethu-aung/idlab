import { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import Hero from "./components/Hero";
import ShortcutReference from "./components/ShortcutReference";
import StatusBar from "./components/StatusBar";
import ThemeToggle from "./components/ThemeToggle";
import UuidList from "./components/UuidList";
import SHORTCUTS from "./data/shortcuts";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useTheme from "./hooks/useTheme";
import useBrowserThemeSync from "./hooks/useBrowserThemeSync";
import useUuidGenerator from "./hooks/useUuidGenerator";

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
  const { theme, toggleTheme } = useTheme();
  useBrowserThemeSync(theme);
  const [isShortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const {
    batchSize,
    setBatchSize,
    setBatchSizeAndCommit,
    visibleBatchSize,
    selectedVersion,
    options,
    formattedUuids,
    copiedUuid,
    feedback,
    isRefreshing,
    regenerate,
    handleCopy,
    copyAll,
    handleVersionChange,
    toggleOption,
    downloadList,
    commitBatchSize,
  } = useUuidGenerator();

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
          <span className="brand-tag mono">/ generator</span>
        </div>
        <nav className="topbar-nav mono" aria-hidden="true" />
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
        <Hero />

        <section className="bench">
          <ControlPanel
            batchSize={batchSize}
            visibleBatchSize={visibleBatchSize}
            selectedVersion={selectedVersion}
            options={options}
            onBatchChange={setBatchSize}
            onBatchCommit={commitBatchSize}
            onVersionChange={handleVersionChange}
            onToggleOption={toggleOption}
          />

          <UuidList
            uuids={formattedUuids}
            version={selectedVersion}
            batch={batchSize}
            opts={options}
            copiedUuid={copiedUuid}
            onCopy={handleCopy}
            onCopyAll={copyAll}
            onRegen={regenerate}
            onDownload={downloadList}
            refreshing={isRefreshing}
          />
        </section>
      </main>

      <StatusBar
        version={selectedVersion}
        batch={batchSize}
        visible={visibleBatchSize}
        opts={options}
        feedback={feedback}
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
