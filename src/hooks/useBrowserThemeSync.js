import { useEffect } from "react";

export default function useBrowserThemeSync(theme) {
  useEffect(() => {
    const computedStyle = window.getComputedStyle(document.documentElement);
    const bg = computedStyle.getPropertyValue("--bg").trim();

    if (bg) {
      let metaTag = document.querySelector('meta[name="theme-color"]');
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "theme-color");
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", bg);
    }
  }, [theme]);
}
