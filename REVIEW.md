# Project Review & Recommendations

_Reviewed: 2026-07-04. Follows up the 2026-06-19 RECOMMENDATIONS.md roadmap,
which is now ~fully shipped (ULID, NanoID, assert-version, copy-as-code)._

## Verdict

Unusually healthy project: 0 npm vulnerabilities, 91.9% statement coverage
(85% floor), hardened non-root/read-only Docker, signed images, CodeQL +
Snyk + Trivy, clean architecture (hooks own state, `App.jsx` composes).
Advice below is tightening screws, not renovation. Ranked by
value-per-effort.

## Quick wins (minutes each)

1. **Root directory litter.** Untracked PNGs (`01-validator-default.png`…),
   `test-design-report*.md`, and `.impeccable/critique/` sit in the repo
   root. Delete or gitignore them. RECOMMENDATIONS.md is stale — it claims
   assert-version is "the only unbuilt item" and recommends building ULID,
   both long since shipped. Delete or rewrite it; a stale roadmap is worse
   than none.

2. **Tighten the CSP.** `.docker/nginx.conf` allows
   `script-src 'unsafe-inline' 'unsafe-eval'` — a production Vite build
   needs neither (no inline scripts in `index.html`, no eval). Drop both;
   keep `style-src 'unsafe-inline'` (App.jsx uses `style={}`). Add
   `base-uri 'self'; object-src 'none'; frame-ancestors 'none'` and a
   `Permissions-Policy: camera=(), microphone=(), geolocation=()` header.
   Biggest genuine security gap; one-line diff.

3. **Widen Dependabot beyond npm.** `dependabot.yml` doesn't watch
   `github-actions` (~15 actions pinned only by tag) or `docker`
   (node:24-alpine, nginx:alpine-slim — base-image CVEs are currently
   hand-patched via `apk upgrade` in the Dockerfile). Two more blocks make
   that automatic.

4. **Cache headers for hashed assets.** nginx serves `/assets/*-[hash].js`
   with no `Cache-Control`. Add `immutable, max-age=1y` for `/assets/`,
   `no-cache` for `index.html`. Also add `application/javascript` and
   `image/svg+xml` to `gzip_types` — depending on the nginx mime map, the
   main JS bundle may currently ship uncompressed. Single largest perf
   lever.

5. **Doc drift + dead line.** CLAUDE.md says "Node 20 → Nginx Alpine";
   Dockerfile uses node:24. `npm prune --production` in the builder stage
   is dead weight — only `dist/` is copied out. Delete it.

6. **`platform.js` has no test file**, violating the governance rule
   ("every file in `src/utils/` MUST have a corresponding test"). It's
   indirectly 100% covered — either write the 5-line test or amend the
   rule; don't leave the rule falsified.

## Worth a small task each

7. **PWA / offline.** The pitch is "everything in-browser, nothing sent to
   a server"; installable + offline makes that tangible. `vite-plugin-pwa`
   (dev-only dep), a manifest, and PNG icons — needed anyway: there is no
   `og:image` and no apple-touch-icon, only `favicon.svg`. Social shares
   currently render bare.

8. **E2E is thin.** One spec (`snippets.spec.js`) for a five-tool app.
   Unit tests cover hooks in isolation, but tab wiring, routing
   canonicalisation, and legacy-path redirects only meet reality in a
   browser. One smoke spec walking the five leaves (`⌥⇧1…5`, generate,
   copy) catches the regression class the unit suite structurally can't.
   While there, add `@axe-core/playwright` and assert zero violations per
   tab — cheap, protects the a11y investment (TabAnnouncer, focus-trap).

9. **CI gap on main.** `lint.yml` (lint+test+build) runs only on
   `pull_request`; a direct push to main runs nothing but the security
   scan. If branch protection forces PRs, fine — but say so, and rename
   the workflow to "CI" since it's the whole gate, not lint.

## Deliberate decisions, not defaults

10. **More ID formats (KSUID / Snowflake / CUID2).** The "ID lab" rubicon
    is already crossed with ULID + NanoID and the rebrand. Snowflake
    *decode* (paste a Discord/Twitter ID, get the timestamp) is the
    most-asked and fits the inspect-first UX with zero deps; KSUID/CUID2
    add less. Pick at most one, deliberately — scope creep remains the
    risk.

11. **SEO polish for the Pages deployment.** `robots.txt` + `sitemap.xml`
    in `public/`, JSON-LD `WebApplication` block in `index.html`. The
    `meta keywords` tag does nothing in 2026 — harmless, but don't
    maintain it. GitHub Pages can't set response headers, so mirror the
    tightened CSP as a `<meta http-equiv>` tag so Pages gets it too, not
    just Docker.
