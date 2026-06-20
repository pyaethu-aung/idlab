import { useState, useEffect, useCallback } from "react";

function pathToTab(pathname) {
  // /bulk folded into the validator, which now handles one UUID or many; the
  // old deep link still lands on the unified tab.
  if (pathname.startsWith("/validator") || pathname.startsWith("/bulk")) return "validator";
  if (pathname.startsWith("/converter")) return "converter";
  if (pathname.startsWith("/ulid")) return "ulid";
  if (pathname.startsWith("/nanoid")) return "nanoid";
  return "generator";
}

function useActiveTab() {
  const [activeTab, setActiveTabState] = useState(() => {
    const { pathname } = window.location;
    if (pathname === "/" || pathname === "") {
      window.history.replaceState(null, "", "/generator");
      return "generator";
    }
    const tab = pathToTab(pathname);
    // Rewrite the retired /bulk path to its new home so the URL stays canonical.
    if (pathname.startsWith("/bulk")) {
      window.history.replaceState(null, "", "/validator");
    }
    return tab;
  });

  useEffect(() => {
    const onPopState = () => setActiveTabState(pathToTab(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setActiveTab = useCallback((tab) => {
    const path = `/${tab}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
    setActiveTabState(tab);
  }, []);

  return { activeTab, setActiveTab };
}

export default useActiveTab;
