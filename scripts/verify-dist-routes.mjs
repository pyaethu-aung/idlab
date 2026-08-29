// Guards the GitHub Pages deep-link fix.
//
// Pages has no rewrite rule, so a route without its own index.html answers 404.
// That failed silently once: the site worked at / and every deep link 404'd,
// because the app canonicalises / to /uuid/generate client-side and nobody
// loads a deep link during local dev.
//
// Asserts the built output carries a page for every route the app can own, that
// 404.html exists as the catch-all, and that asset URLs are absolute -- relative
// ones resolve against the request path and break at any nested route.
//
//   npm run build && npm run verify:dist
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { LEAF_ORDER, pathForLeaf, LEGACY_PATHS } from "../src/data/tabs.js";

const dist = resolve(import.meta.dirname, "..", "dist");
const failures = [];

if (!existsSync(join(dist, "index.html"))) {
  console.error("dist/index.html is missing - run `npm run build` first.");
  process.exit(2);
}

const routes = [
  ...LEAF_ORDER.map(pathForLeaf),
  "/uuid",
  ...Object.keys(LEGACY_PATHS),
];

for (const route of routes) {
  const page = join(dist, route, "index.html");
  if (!existsSync(page)) failures.push(`${route} -> no index.html (would 404 on Pages)`);
}

if (!existsSync(join(dist, "404.html"))) {
  failures.push("404.html missing - unknown paths would not boot the app");
}

const html = readFileSync(join(dist, "index.html"), "utf8");
for (const m of html.matchAll(/(?:src|href)="(\.\/[^"]*assets\/[^"]*)"/g)) {
  failures.push(`relative asset URL ${m[1]} - breaks at nested routes; base must be "/"`);
}

if (failures.length) {
  console.error(`dist route check failed (${failures.length}):`);
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(`dist route check passed: ${routes.length} routes + 404.html, absolute asset URLs.`);
