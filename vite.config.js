import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { LEAF_ORDER, pathForLeaf, LEGACY_PATHS } from "./src/data/tabs.js";

// GitHub Pages serves static files and has no rewrite rule, so a request for a
// pushState route like /uuid/generate finds no file and 404s.
//
// Two halves to the fix. Every route the app can own is pre-rendered as its own
// directory + index.html, so real navigations answer 200 -- Pages does serve
// 404.html for unmatched paths, but always with a 404 status, which search
// engines and uptime checks take at face value. 404.html is still written, as
// the catch-all that boots the app for anything not in the list.
//
// The route list is imported from src/data/tabs.js rather than restated here:
// that module is already the routing source of truth, so a new tool cannot ship
// with a route that 404s in production.
function githubPagesSpaFallback() {
  return {
    name: "gh-pages-spa-fallback",
    apply: "build",
    closeBundle() {
      const dist = resolve(import.meta.dirname, "dist");
      const index = resolve(dist, "index.html");
      if (!existsSync(index)) return;

      const routes = [
        ...LEAF_ORDER.map(pathForLeaf), // /uuid/generate, /ulid, ...
        "/uuid", // bare family, canonicalised client-side to its first mode
        ...Object.keys(LEGACY_PATHS), // /generator, /validator, /bulk, /converter
      ];
      for (const route of routes) {
        const dir = join(dist, route);
        mkdirSync(dir, { recursive: true });
        copyFileSync(index, join(dir, "index.html"));
      }
      // Anything else (a typo, a deleted route) still boots the app, which
      // resolves the path to a leaf and renders the default where it can't.
      copyFileSync(index, resolve(dist, "404.html"));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Absolute, not "./": the site is served from the root of the custom domain
  // (public/CNAME -> idlab.pyaethuaung.com, and the old project-subpath URL
  // 301s there). Relative asset URLs would resolve against the request path, so
  // a page at /uuid/generate would look for /uuid/assets/index-*.js and fail.
  base: "/",
  plugins: [react(), githubPagesSpaFallback()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.js"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.agent/**", "**/.agents/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
