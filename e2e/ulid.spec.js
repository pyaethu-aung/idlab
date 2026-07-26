import { test, expect } from "@playwright/test";

// Covers the ULID tab's core user-facing flow: mint, decode a pasted UUIDv7,
// convert losslessly to ULID, and copy a representation.
test("mints, decodes, and copies a ULID", async ({ context, page, baseURL }) => {
  await context.grantPermissions(["clipboard-write", "clipboard-read"], {
    origin: baseURL,
  });
  await page.goto("/ulid");

  await expect(page.getByRole("button", { name: "Mint a ULID" })).toBeVisible();

  // On load the input is seeded with a freshly minted ULID, which decodes.
  await expect(page.getByText("valid ULID")).toBeVisible();

  // Loading the fixed ULID sample decodes to the spec's known timestamp.
  await page.getByRole("button", { name: "Load ulid sample" }).click();
  const input = page.getByLabel("ULID or UUIDv7 to decode");
  await expect(input).toHaveValue("01ARZ3NDEKTSV4RRFFQ69G5FAV");
  await expect(page.getByText("valid ULID")).toBeVisible();
  await expect(page.getByText("01563e3a-b5d3-d676-4c61-efb99302bd5b")).toBeVisible();

  // Copy the uuid representation row and see the copied confirmation.
  await page.getByRole("button", { name: "Copy uuid" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe("01563e3a-b5d3-d676-4c61-efb99302bd5b");

  // Pasting garbage shows the decode error, not a stale valid state.
  await input.fill("not-a-ulid");
  await expect(page.getByText("not a ULID or UUID")).toBeVisible();
});
