import { defineConfig, devices } from "@playwright/test";

// E2E / visual-critique config. `webServer` auto-starts the Vite dev server on
// a fixed port so a developer runs one command (`npm run test:e2e`) with no
// manual setup. The app derives its theme from `prefers-color-scheme` when no
// preference is stored, so the two Chromium projects (dark + light) exercise
// both themes for free — useful for design critique of a themable UI.
//
// Specs live in ./e2e; Vitest only globs ./src, so unit and E2E suites never
// collide. First-time setup needs the browser binary: `npx playwright install
// chromium`.
const PORT = 5173;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-dark",
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
    },
    {
      name: "chromium-light",
      use: { ...devices["Desktop Chrome"], colorScheme: "light" },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
