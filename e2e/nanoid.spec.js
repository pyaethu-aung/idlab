import { test, expect } from "@playwright/test";

// Covers the NanoID tab's core user-facing flow: mint a batch, switch
// alphabet (re-minting live), and copy one id plus the full batch.
test("mints, switches alphabet, and copies NanoIDs", async ({
  context,
  page,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-write", "clipboard-read"], {
    origin: baseURL,
  });
  await page.goto("/nanoid");

  await expect(page.getByText("generated · 8")).toBeVisible();

  // Switching to the hex alphabet re-mints immediately and updates entropy.
  await page.getByRole("button", { name: "hex", exact: true }).click();
  await expect(page.locator(".v-props-grid").getByText("16 symbols")).toBeVisible();
  const firstRow = page.getByRole("button", { name: "Copy id 1" }).locator("..");
  const firstId = firstRow.locator("code");
  await expect(firstId).toHaveText(/^[0-9a-f]+$/);

  // Copying one id writes exactly that value to the clipboard.
  const idValue = await firstId.textContent();
  await page.getByRole("button", { name: "Copy id 1" }).click();
  let clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(idValue);

  // Copy-all joins every visible id with newlines.
  await page.getByRole("button", { name: "Copy all ids" }).click();
  clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.split("\n")).toHaveLength(8);
});
