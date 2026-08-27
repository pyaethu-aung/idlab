import { useEffect } from "react";

// --bg is authored in OKLCH, which older mobile browsers reject outright in
// theme-color, leaving the address bar on a stale colour. Round-trip it
// through a 1x1 canvas to get the sRGB hex the meta tag can always parse.
function toHex(color) {
  // Already sRGB: nothing to convert, and no canvas to reach for.
  if (/^(#|rgb)/i.test(color)) return color;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    return null;
  }
}

export default function useBrowserThemeSync(theme) {
  useEffect(() => {
    const computedStyle = window.getComputedStyle(document.documentElement);
    const bg = computedStyle.getPropertyValue("--bg").trim();

    if (bg) {
      // Exactly one unscoped theme-color tag: a media-scoped pair would let
      // the OS preference contradict the in-app toggle, and querySelector
      // would only ever reach the first of them anyway.
      let metaTag = document.querySelector(
        'meta[name="theme-color"]:not([media])'
      );
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "theme-color");
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", toHex(bg) ?? bg);
    }
  }, [theme]);
}
