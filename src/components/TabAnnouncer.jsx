import { useEffect, useRef, useState } from "react";
import { TABS } from "../data/tabs";

const TAB_LABELS = Object.fromEntries(TABS.map(({ id, label }) => [id, label]));

// A single, always-mounted live region for tab changes. The per-tab status bar
// footer remounts on every switch, so it can't carry the announcement — this
// stable region can. It starts empty and only speaks after the first change, so
// loading the app never announces the default tab. Switching by click, keyboard
// shortcut, or browser back/forward all flow through `activeTab`, so every path
// is covered once here — and a keyboard switch that moves no focus still speaks.
//
// We compare against the previously-seen tab rather than a first-render flag:
// the comparison is idempotent, so StrictMode's double-invoked effect can't fire
// a phantom announcement on load (a boolean flag would flip and then speak).
function TabAnnouncer({ activeTab }) {
  const [message, setMessage] = useState("");
  const prevTab = useRef(activeTab);

  useEffect(() => {
    if (prevTab.current === activeTab) return;
    prevTab.current = activeTab;
    setMessage(`${TAB_LABELS[activeTab] ?? activeTab} tab`);
  }, [activeTab]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}

export default TabAnnouncer;
