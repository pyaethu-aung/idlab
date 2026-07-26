import { test, expect } from "@playwright/test";

// Covers the Converter tab's core user-facing flow: paste a UUID, see it
// broken into every representation, and copy one row.
test("converts a UUID to every representation and copies one", async ({
  context,
  page,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-write", "clipboard-read"], {
    origin: baseURL,
  });
  await page.goto("/uuid/convert");

  const input = page.getByLabel("UUID to convert");
  await input.fill("018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d");

  await expect(
    page.getByText("018e3f4a9c2b7d8e9f7a9b3c2e5f6a7d", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("018E3F4A-9C2B-7D8E-9F7A-9B3C2E5F6A7D", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("urn:uuid:018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d", { exact: true })
  ).toBeVisible();

  // Copying the canonical row writes exactly that value to the clipboard.
  await page
    .getByRole("listitem")
    .filter({ hasText: "canonical" })
    .getByRole("button", { name: "Copy this value" })
    .click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe("018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d");

  // A sample pill swaps the input and re-converts.
  await page.getByRole("button", { name: "Load v4 sample UUID" }).click();
  await expect(input).not.toHaveValue("018e3f4a-9c2b-7d8e-9f7a-9b3c2e5f6a7d");
});
