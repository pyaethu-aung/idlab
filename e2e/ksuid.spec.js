import { test, expect } from "@playwright/test";

// Covers the KSUID tab's core user-facing flow: mint, decode a pasted value,
// and copy a representation. Mirrors the ULID tab's shape (generate + paste +
// inspect), since KSUID has no batch UI.
test("mints, decodes, and copies a KSUID", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["clipboard-write", "clipboard-read"], {
    origin: baseURL,
  });
  await page.goto("/ksuid");

  await expect(page.getByRole("button", { name: "Mint a KSUID" })).toBeVisible();

  // On load the input is seeded with a freshly minted KSUID, which decodes.
  await expect(page.getByText("valid KSUID")).toBeVisible();

  // Loading the sample pill swaps in the known fixed KSUID and decodes it.
  await page.getByRole("button", { name: "Load ksuid sample" }).click();
  const input = page.getByLabel("KSUID to decode");
  await expect(input).toHaveValue("2YBXZIdZpuEB0Z0gxchzBCwPdBh");
  await expect(page.getByText("valid KSUID")).toBeVisible();

  // Copy the ksuid representation row and see the copied confirmation.
  await page.getByRole("button", { name: "Copy ksuid" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();

  // Pasting garbage shows the decode error, not a stale valid state.
  await input.fill("not-a-ksuid");
  await expect(page.getByText(/expected 27 characters/)).toBeVisible();
});
