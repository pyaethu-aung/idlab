import { useMemo, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import Hero from "./components/Hero";
import InsightCards from "./components/InsightCards";
import ShortcutReference from "./components/ShortcutReference";
import ThemeToggle from "./components/ThemeToggle";
import UuidList from "./components/UuidList";
import SHORTCUTS from "./data/shortcuts";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useTheme from "./hooks/useTheme";
import useBrowserThemeSync from "./hooks/useBrowserThemeSync";
import useUuidGenerator from "./hooks/useUuidGenerator";
import "./App.css";

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
    clipboardSupported,
    isRefreshing,
    isDownloading,
    regenerate,
    handleCopy,
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

  const insights = useMemo(
    () => [
      { label: "Version", value: selectedVersion.toUpperCase() },
      { label: "Batch size", value: formattedUuids.length },
      { label: "Characters", value: formattedUuids[0]?.length ?? 0 },
    ],
    [selectedVersion, formattedUuids]
  );

  return (
    <div className="app-shell relative isolate overflow-hidden">
      {/* Top Navigation Bar: Shortcuts & Theme Toggle */}
      <div className="relative z-20 flex items-center justify-end gap-3 px-4 py-4 md:px-8">
        <button
          type="button"
          onClick={() => setShortcutHelpOpen(true)}
          className="theme-ghost-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition"
          aria-label="Open keyboard shortcuts reference"
        >
          <span aria-hidden="true">?</span>
          <span>Shortcuts</span>
        </button>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      {/* Hero Section: Full Width (Full Bleed) */}
      <Hero feedback={feedback} />

      {/* Main Content: Constrained Width */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 lg:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="min-w-0 overflow-hidden rounded-[32px] border theme-border-subtle theme-card theme-shadow-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] theme-text-accent">
                  Latest batch
                </p>
                <h2 className="text-2xl font-semibold theme-text-primary">
                  {formattedUuids.length} UUID
                  {formattedUuids.length === 1 ? "" : "s"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={regenerate}
                  className="theme-ghost-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition"
                  aria-live="polite"
                  aria-busy={isRefreshing}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`h-4 w-4 ${isRefreshing ? "icon-spin" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582M20 20v-5h-.581M5 9a7 7 0 0 1 12.138-3.995L19 7M19 15a7 7 0 0 1-12.139 3.995L5 17"
                    />
                  </svg>
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={downloadList}
                  className={`theme-ghost-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${isDownloading ? "is-busy" : ""
                    }`}
                  aria-live="polite"
                  aria-busy={isDownloading}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <span className="inline-loader" aria-hidden="true" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v12m0 0 4-4m-4 4-4-4M4 18h16"
                        />
                      </svg>
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>

            <InsightCards insights={insights} />

            <UuidList
              uuids={formattedUuids}
              copiedUuid={copiedUuid}
              onCopy={handleCopy}
            />
          </article>

          <ControlPanel
            batchSize={batchSize}
            visibleBatchSize={visibleBatchSize}
            selectedVersion={selectedVersion}
            options={options}
            onBatchChange={setBatchSize}
            onBatchCommit={commitBatchSize}
            onVersionChange={handleVersionChange}
            onToggleOption={toggleOption}
            onGenerate={regenerate}
            clipboardSupported={clipboardSupported}
          />
        </section>
      </main>
      <ShortcutReference
        isOpen={isShortcutHelpOpen}
        shortcuts={SHORTCUTS}
        onClose={() => setShortcutHelpOpen(false)}
      />
    </div>
  );
}

export default App;
