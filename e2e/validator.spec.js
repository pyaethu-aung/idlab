import { test, expect } from "@playwright/test";

// Covers the Validator tab's core user-facing flow: paste a mixed batch,
// see valid/invalid counts, expand a row's detail, and copy all valid ones.
test("validates a mixed batch and copies the valid set", async ({
  context,
  page,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-write", "clipboard-read"], {
    origin: baseURL,
  });
  await page.goto("/uuid/validate");

  const input = page.getByLabel("UUIDs to validate, one per line");
  await input.fill(
    [
      "00000000-0000-0000-0000-000000000000",
      "018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d",
      "not-a-uuid",
    ].join("\n")
  );

  const status = page.getByRole("contentinfo");
  await expect(status.getByText("2 valid")).toBeVisible();
  await expect(status.getByText("1 invalid")).toBeVisible();
  await expect(status.getByText("3 total")).toBeVisible();
  await expect(page.getByText("invalid character")).toBeVisible();

  // Expanding a row surfaces the parsed field/property breakdown.
  await page.getByRole("button", { name: "Expand details for line 1" }).click();
  await expect(page.getByText("nil uuid?")).toBeVisible();

  // Copy-all only copies the valid rows.
  await page.getByRole("button", { name: "Copy all valid UUIDs" }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(
    "00000000-0000-0000-0000-000000000000\n018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d"
  );
});
