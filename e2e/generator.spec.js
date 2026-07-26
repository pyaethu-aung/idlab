import { test, expect } from "@playwright/test";

// Covers the Generator tab's core user-facing flow: switch version, resize
// the batch, copy a single row, and copy all. Mirrors ksuid.spec.js's shape.
test("generates, resizes, and copies UUIDs", async ({ context, page, baseURL }) => {
  await context.grantPermissions(["clipboard-write", "clipboard-read"], {
    origin: baseURL,
  });
  await page.goto("/uuid/generate");

  // v4 is the default, with a batch of 8 rows shown.
  await expect(page.getByText("/ output · 8 rows")).toBeVisible();

  // Switching version regenerates the batch and updates the status feedback.
  await page.getByRole("button", { name: /^v7 Unix Time/ }).click();
  await expect(page.getByText("Switched to UUID V7")).toBeVisible();

  // Resizing the batch to 25 regenerates the batch, but the preview caps
  // at 20 visible rows (see useUuidGenerator's visibleBatchSize).
  await page.getByRole("button", { name: "25", exact: true }).click();
  await expect(page.getByText("/ output · 20 rows")).toBeVisible();

  // Copying a single row flips its button to the "Copied" state.
  await page.getByRole("button", { name: "Copy UUID" }).first().click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();

  // Copy all writes every visible row to the clipboard.
  await page.getByRole("button", { name: "Copy all UUIDs" }).click();
  await expect(page.getByText(/^Copied \d+ UUIDs$/)).toBeVisible();
});
