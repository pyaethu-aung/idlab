import { test, expect } from "@playwright/test";

// Covers the global keyboard-shortcut map that unit tests can't exercise
// against a real browser: tab jumps, cycling, and the shared verb keys.
test("jumps and cycles tabs, and dispatches per-tab verbs", async ({ page }) => {
  await page.goto("/uuid/generate");

  // Every other spec drives the app through locators, which auto-retry; this
  // one sends a raw key, which is delivered once and dropped if nothing is
  // listening yet. The window keydown handler is attached from a useEffect,
  // so it lands after paint -- meaning `load` is not the same thing as
  // "interactive". Wait for the app to go quiet (webfonts included, since
  // their swap repaints straight over this window) before the first press.
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".topbar")).toBeVisible();

  // Alt+Shift+<digit> jumps directly to the Nth leaf in LEAF_ORDER.
  await page.keyboard.press("Alt+Shift+5");
  await expect(page).toHaveURL(/\/nanoid$/);

  // Alt+Shift+ArrowRight/Left cycles leaves, wrapping at the ends.
  await page.keyboard.press("Alt+Shift+ArrowRight");
  await expect(page).toHaveURL(/\/ksuid$/);
  await page.keyboard.press("Alt+Shift+ArrowRight");
  await expect(page).toHaveURL(/\/uuid\/generate$/);
  await page.keyboard.press("Alt+Shift+ArrowLeft");
  await expect(page).toHaveURL(/\/ksuid$/);

  // Cmd/Ctrl+Enter mints on the active tab (KSUID here).
  const input = page.getByLabel("KSUID to decode");
  const before = await input.inputValue();
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(input).not.toHaveValue(before);

  // Alt+Backspace clears the input on tabs that support it.
  await page.keyboard.press("Alt+Backspace");
  await expect(input).toHaveValue("");
});
