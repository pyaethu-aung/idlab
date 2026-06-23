import { test, expect } from "@playwright/test";

// Example E2E spec that doubles as a design-critique aid: it captures the
// Generator's "Copy as code" panel and runs once per project, so you get both
// a dark and a light screenshot under test-results/ for visual review.
//
// Run it with `npm run test:e2e` (the dev server starts automatically). Use
// `npm run test:e2e:ui` for the interactive runner with time-travel.
test("copy-as-code panel renders highlighted snippets", async ({ page }, testInfo) => {
  await page.goto("/");

  const panel = page.locator(".snip-panel");
  await expect(panel).toBeVisible();

  // Full programs are the default; the js block is the complete program.
  await expect(panel).toContainText("console.log(uuidv4())");

  // Save a per-theme screenshot for critique (one per project: dark + light).
  await panel.screenshot({ path: testInfo.outputPath("snippets.png") });

  // The inline/full toggle flips the rendered form to the compact one-liner.
  await page.getByRole("button", { name: "inline" }).click();
  await expect(panel).toContainText("import uuid; uuid.uuid4()");
});
