import { useState, useEffect, useCallback } from "react";

function pathToTab(pathname) {
  if (pathname.startsWith("/validator")) return "validator";
  return "generator";
}

function useActiveTab() {
  const [activeTab, setActiveTabState] = useState(() => {
    const { pathname } = window.location;
    if (pathname === "/" || pathname === "") {
      window.history.replaceState(null, "", "/generator");
      return "generator";
    }
    return pathToTab(pathname);
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
