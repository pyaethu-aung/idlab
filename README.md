# idlab: ID workbench (AI Built)

A keyboard-first ID workbench built with React 19 and Vite, organised by ID family. **UUID** is the anchor (generate v1/v3/v4/v5/v6/v7 plus nil/max, validate and decode, convert between representations), with **ULID** and **NanoID** alongside it. Generate, validate, decode, convert, and copy or download results without leaving the keyboard.

The top bar selects an ID family (UUID / ULID / NanoID); within UUID a mode switcher picks the operation (Generate / Validate / Convert). The canonical routes are `/uuid/generate`, `/uuid/validate`, `/uuid/convert`, `/ulid`, and `/nanoid`; the old `/generator`, `/validator`, `/converter`, and `/bulk` links redirect to their new homes.

## AI Agent & Tooling
- Core implementation produced by GitHub Copilot running the GPT-5.1-Codex model.
- Copilot authored UI layout, React state logic, clipboard/download utilities, and Tailwind styling inside VS Code.
- Human input focused on high-level requirements, reviewing each iteration, and applying the prompts listed below.
- Spec-driven development workflow managed with [spec-kit](https://github.com/speckit-ai/speckit) **v0.8.7**.

## Feature Highlights
- Unified slider that drives both the on-screen preview count (capped at 20) and the downloadable batch size (1–200).
- Version selector covering v1, v3, v4, v5, v6, v7, nil, and max via the `uuid` npm package. v3/v5 are deterministic (namespace + name); v6 is the index-friendly field-reordered rewrite of v1.
- Pinned timestamp for the time-based versions (v1, v6, v7): switch from live "now" to a chosen moment to mint UUIDs for that instant, with a readout echoing the epoch milliseconds and decoded UTC. Useful for testing time-ordered ID systems; the inverse of the validator's timestamp decode.
- Validator tab handles one UUID or many: paste a single value or a list (one per line), or upload a `.txt` / `.csv` file — select multiple files to merge their contents. Every entry becomes a row in a triage table of status, version, variant, and timestamp, with a valid/invalid/total summary and one-click copy of every valid UUID. Click any row to expand the full inspector inline (parsed structure, properties, timestamp decode, and the v1↔v6 counterpart) — a lone UUID auto-expands. The retired `/bulk` deep link now lands here (`/uuid/validate`).
- ULID tab mints ULIDs (crypto-random, no dependency) and decodes a pasted ULID into its timestamp, randomness, and equivalent UUID forms. Accepts a UUIDv7 in the same field to convert the other way, since ULID and UUIDv7 share the 48-bit millisecond timestamp.
- NanoID tab generates batches of compact, URL-safe NanoIDs (crypto-random, no dependency) with an adjustable length (2–36) and alphabet preset (url-safe, alphanumeric, lowercase, hex, numbers); a live entropy readout reports the bit strength and the id count needed for a 1% collision chance.
- Copy-to-clipboard with micro-interaction feedback plus a timestamped download action guarded against oversized files.
- Insight cards summarizing current options (version, batch size, characters per UUID) placed directly above the list for quick scanning.
- Responsive layout with gradients, keyboard-friendly control handling, and pointer event throttling to avoid jank.

## Keyboard Shortcuts
- ⌘/Ctrl + Enter — Regenerate the latest UUID batch.
- ⌘/Ctrl + Alt + S — Download the current batch as a `.txt` file.
- ⌘/Ctrl + Shift + C — Copy the first UUID in the visible list.
- ⌥/Alt + Arrow Up/Down — Adjust batch size (hold Shift for ±10).
- ⌥/Alt + 1 … 8 — Switch generators in order: v4, v1, v6, v7, v3, v5, nil, max.
- ⌥/Alt + U / H / B — Toggle uppercase, remove hyphens, or wrap with braces.
- ⌥/Alt + R / [ / − — (Validator tab) Toggle strict RFC 4122, allow braces, allow no-hyphens.
- ⌥/Alt + Shift + 1 … 5 — Jump to a tool: UUID Generate, UUID Validate, UUID Convert, ULID, NanoID.
- ⌥/Alt + Shift + ← / → — Cycle to the previous / next tool (wraps at the ends).
- Shift + ? — Open the in-app shortcut reference overlay.
- Esc — Close the shortcut reference overlay.

## Rephrased Prompt Log
1. Build a Tailwind-forward UUID generator interface that feels polished and modern.
2. Add a selector that lets the user toggle between UUID versions v1, v4, and v7.
3. Keep badges/stat labels on a single line so that wording like "Characters Each" never wraps or overflows.
4. Provide animated feedback when copying UUIDs and acknowledge downloads with contextual text.
5. Extend download batches to 200 entries while keeping only 20 visible in the live preview.
6. Replace multiple controls with one slider that manages both preview and download counts, updating immediately as it moves.
7. Relocate version, batch size, and per-UUID character details into the stat cards above the list to avoid duplicate text elsewhere.
8. Introduce power-user keyboard shortcuts for regeneration, downloading, batch tweaks, and formatting toggles.
9. Add an in-app shortcut reference modal opened via Shift + ?, plus documentation describing every combo.

## Getting Started
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173` (or the URL printed in the terminal) to interact with the UI.

## Tech Stack
- React 19 + Vite
- Tailwind CSS
- `uuid` npm package
- Clipboard and File APIs

## Design System

All design tokens — colour, typography, spacing, radius, and motion — live in `src/design-system/`:

| File | Purpose |
|------|---------|
| `tokens.json` | Token definitions in W3C Design Token format |
| `tokens.css` | CSS custom properties consumed by the app |
| `Design System.html` | Living reference page; open directly in a browser |

`src/index.css` imports `tokens.css` as the single source of truth for all design values. To browse every token rendered visually, open `src/design-system/Design System.html` in a browser — it links to `tokens.css` automatically.

## Contributing

### End-to-end Testing with Playwright

Before opening a pull request, verify the UI using [Playwright](https://playwright.dev):

```bash
npx playwright install        # first time only — installs browser binaries
npx playwright test           # run all E2E tests headlessly
npx playwright test --ui      # interactive test runner with time-travel
```

Key flows to cover:

- **Keyboard shortcuts** — regenerate, copy, download, batch size, version switch, formatting toggles
- **Clipboard & download** — copy feedback, `.txt` file output with correct row count
- **Theme switching** — dark ↔ light, persistence across reload
- **Responsive layout** — workbench collapse at the 920 px breakpoint

### Design Snapshot Testing

[`pixelmatch`](https://github.com/mapbox/pixelmatch) and [`pngjs`](https://github.com/lukeapage/pngjs)
are installed as dev dependencies to enable pixel-level visual diffing between design
snapshots and the live app.

Snapshots are captured by the `/test-design` skill and saved to `.test-design/diffs/`.
On subsequent runs, pixelmatch compares the fresh screenshot against the saved baseline
and reports any pixel-level divergence.

## Security & Maintenance

### Automated Dependency Updates
This project uses **GitHub Dependabot** to automatically detect vulnerable dependencies and create pull requests to fix them.

- **Configuration**: Managed via `.github/dependabot.yml`.
- **Schedule**: Scans run daily.
- **PR Limits**: Maximum 10 open security PRs at a time to prevent alert fatigue (Best Practice: [Dependabot Security Config](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates)).
- **Review Policy**: **Manual review is required** for all security updates. Auto-merge is strictly disabled to ensure human oversight.
- **Notifications**: Alerts are sent via GitHub's native notification system (Web/Email). Ensure you are "Watching" the repository to receive them.

## Docker Support

Production-ready Docker support is available with optimized multi-stage builds and security hardening. Images are multi-platform (`linux/amd64` and `linux/arm64`).

### Pull from GHCR
```bash
# Pull the latest published version (e.g. v1.0.0 → tag 1.0.0)
docker pull ghcr.io/pyaethu-aung/idlab:1.0.0

# Run on port 8080
docker run -d -p 8080:80 --name idlab-app ghcr.io/pyaethu-aung/idlab:1.0.0
```

### Build Locally
```bash
# Build locally
npm run docker:build

# Run locally (port 8080)
npm run docker:run
```

### CI/CD Publishing
Images are published to GHCR **only on version tag pushes** (`v*.*.*`). Pushes to `main` and pull requests build and scan but do not publish. A daily scheduled Trivy scan runs to catch newly disclosed CVEs.

| Event            | Build | Trivy Scan | Push to Registry | Cosign Sign |
|------------------|-------|------------|------------------|-------------|
| Push to `main`   | ✅    | ✅         | ❌               | ❌          |
| Pull request     | ✅    | ✅         | ❌               | ❌          |
| Tag `v*.*.*`     | ✅    | ✅         | ✅               | ✅          |
| Schedule (daily) | ✅    | ✅         | ❌               | ❌          |

For detailed instructions on architecture, security, and troubleshooting, see [Docker Quickstart](specs/003-docker-containerization/quickstart.md).

