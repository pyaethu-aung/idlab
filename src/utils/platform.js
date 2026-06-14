export const IS_MAC =
  typeof navigator !== "undefined" && (
    navigator.userAgentData?.platform === "macOS" ||
    /Mac/.test(navigator.platform ?? "") ||
    /Macintosh/.test(navigator.userAgent ?? "")
  );

export const KEY_META = IS_MAC ? "⌘" : "Ctrl+";
export const KEY_OPT  = IS_MAC ? "⌥" : "Alt+";
