# Implementation Plan: Fix CI/CD Workflow Issues

**Branch**: `008-fix-cicd-issues` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-fix-cicd-issues/spec.md`

## Summary

Fix five GitHub Actions YAML issues across three workflow files identified in code review of the `007-ci-cd-optimizations` branch. All changes are confined to `.github/workflows/` — no application source code, Dockerfile, or test logic is touched. The critical fix (tag trigger separation) ensures version-tagged Docker image publishes are never silently skipped by path filters. The remaining four fixes improve security scan reliability and ESLint caching efficiency.

## Technical Context

**Language/Version**: GitHub Actions workflow YAML (schema v2)
**Primary Dependencies**: `actions/cache@v4`, `snyk/actions/node@v1.0.0`, `github/codeql-action/upload-sarif@v4`, `docker/build-push-action@v5`
**Storage**: N/A
**Testing**: Automated CI gate — all existing workflows must pass on a PR to `main` (SC-005)
**Target Platform**: GitHub Actions runners (`ubuntu-latest`)
**Project Type**: CI/CD configuration only — no `src/` or application structure changes
**Performance Goals**: ESLint cache hit rate ≥90% for source-only changes (SC-003)
**Constraints**: Changes must not regress any other workflow trigger or condition; YAML-only scope
**Scale/Scope**: 3 workflow files, 5 discrete line-level edits

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ Pass | YAML edits are minimal and targeted; no dead entries post-fix |
| II. Testing & Execution | ✅ Pass | CI gate on PR to `main` validates all changes (SC-005); no unit tests required for YAML-only changes |
| III. UX Consistency | N/A | No user-facing interface changes |
| IV. Performance | ✅ Pass | Fix 4+5 directly improve lint cache hit rate (SC-003) |
| V. Architecture & Structure | N/A | No `src/` structure changes |
| VI. Execution Discipline | ✅ Pass | PR-based CI is the validation mechanism; existing `npm run test / lint / build` suite runs unchanged |
| VII. Cross-Platform | N/A | No UI changes |
| VIII. Theme Support | N/A | No UI changes |
| IX. Skill-Driven | ✅ Pass | `docker-cicd-integration` skill consulted; tag-push strategy, GHCR integration, and Cosign patterns verified against skill guidelines |

**No constitution violations. No Complexity Tracking required.**

## Project Structure

### Documentation (this feature)

```text
specs/008-fix-cicd-issues/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created here)
```

### Source Files (all changes confined here)

```text
.github/workflows/
├── docker-publish.yml   ← Fix 1 (Critical): separate tag trigger
│                           Fix 3 (Low): remove eslint.config.js from paths
├── security.yml         ← Fix 2 (Medium): narrow SARIF upload condition
└── lint.yml             ← Fix 4 (Low): narrow ESLint cache key
                            Fix 5 (Low): add restore-keys fallback
```

No changes to `src/`, `tests/`, `Dockerfile`, `package.json`, or any other file.

**Structure Decision**: Configuration-only change. No src/ tree modifications. The `.github/workflows/` directory is the sole scope of this feature.

---

## Phase 0: Research

**See**: [research.md](research.md) — all design decisions resolved; no NEEDS CLARIFICATION items remain.

Key decisions surfaced during research:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tag trigger separation mechanism | Two `push:` entries in `on:` block | GitHub Actions processes duplicate YAML `on` event keys additively; each acts as an independent trigger |
| SARIF upload guard | `steps.snyk.outcome == 'success'` | Idiomatic step-outcome expression; ties gate to actual Snyk success state, not filesystem side-effect |
| Cache key scope | `hashFiles('eslint.config.js', 'package-lock.json')` only | ESLint's own internal cache (`.eslintcache`) handles per-file invalidation; busting on `src/**` is redundant |
| restore-keys prefix | `${{ runner.os }}-eslint-` | Single prefix covers cross-branch fallback without being so broad as to restore stale entries |

---

## Phase 1: Design

### Fix 1 — `docker-publish.yml`: Separate Tag Trigger from Path-Filtered Push

**Problem**: `tags: ['v*.*.*']` and `paths: [...]` under the same `push:` block require BOTH to match. A tag push on a commit with no listed-file changes silently skips the workflow.

**Before** (lines 3–14):
```yaml
on:
  push:
    branches: [ "main" ]
    tags: [ 'v*.*.*' ]
    paths:
      - ".github/workflows/docker-publish.yml"
      - "src/**"
      - "index.html"
      - "package.json"
      - "package-lock.json"
      - "vite.config.js"
      - "eslint.config.js"
```

**After**:
```yaml
on:
  push:
    branches: [ "main" ]
    paths:
      - ".github/workflows/docker-publish.yml"
      - "src/**"
      - "index.html"
      - "package.json"
      - "package-lock.json"
      - "vite.config.js"
  push:
    tags: [ 'v*.*.*' ]
```

Changes: `tags` moved to its own `push:` entry (no `paths`); `eslint.config.js` removed from branch push paths (Fix 3 combined here).

---

### Fix 2 — `security.yml`: Narrow SARIF Upload Condition

**Problem**: `if: always()` causes the upload step to run even when Snyk failed and produced no `snyk.sarif`, resulting in a "file not found" error that masks the real failure.

**Before** (lines 53–73):
```yaml
      - name: Run Snyk vulnerability scanner
        uses: snyk/actions/node@v1.0.0
        with:
          args: --severity-threshold=high --sarif-file-output=snyk.sarif
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true

      - name: Upload Snyk results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: snyk.sarif
        if: always()
```

**After**:
```yaml
      - name: Run Snyk vulnerability scanner
        id: snyk
        uses: snyk/actions/node@v1.0.0
        with:
          args: --severity-threshold=high --sarif-file-output=snyk.sarif
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true

      - name: Upload Snyk results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: snyk.sarif
        if: steps.snyk.outcome == 'success'
```

Changes: Add `id: snyk` to the scanner step; replace `if: always()` with `if: steps.snyk.outcome == 'success'`.

---

### Fix 3 — `docker-publish.yml`: Remove `eslint.config.js` from Path Filters

Combined with Fix 1 above. Remove `- "eslint.config.js"` from both `push.paths` and `pull_request.paths`. ESLint configuration has no bearing on Docker image contents.

**pull_request paths** — Before (lines 15–24):
```yaml
  pull_request:
    branches: [ "main" ]
    paths:
      - ".github/workflows/docker-publish.yml"
      - "src/**"
      - "index.html"
      - "package.json"
      - "package-lock.json"
      - "vite.config.js"
      - "eslint.config.js"
```

**After**:
```yaml
  pull_request:
    branches: [ "main" ]
    paths:
      - ".github/workflows/docker-publish.yml"
      - "src/**"
      - "index.html"
      - "package.json"
      - "package-lock.json"
      - "vite.config.js"
```

---

### Fix 4 — `lint.yml`: Narrow ESLint Cache Key Scope

**Problem**: `hashFiles('eslint.config.js', 'package-lock.json', 'src/**')` includes all source files, busting the cache on every source change even though ESLint's internal cache (`.eslintcache`) already handles per-file invalidation.

**Before** (line 49):
```yaml
          key: ${{ runner.os }}-eslint-${{ hashFiles('eslint.config.js', 'package-lock.json', 'src/**') }}
```

**After**:
```yaml
          key: ${{ runner.os }}-eslint-${{ hashFiles('eslint.config.js', 'package-lock.json') }}
```

---

### Fix 5 — `lint.yml`: Add `restore-keys` Fallback

**Problem**: Without `restore-keys`, a cache miss (e.g., first run on a new branch) starts completely cold even though a recent related cache entry exists on a parent branch.

**Before** (lines 45–49):
```yaml
      - name: Cache ESLint dependencies
        uses: actions/cache@v4
        with:
          path: .eslintcache
          key: ${{ runner.os }}-eslint-${{ hashFiles('eslint.config.js', 'package-lock.json', 'src/**') }}
```

**After** (combining Fix 4 + Fix 5):
```yaml
      - name: Cache ESLint dependencies
        uses: actions/cache@v4
        with:
          path: .eslintcache
          key: ${{ runner.os }}-eslint-${{ hashFiles('eslint.config.js', 'package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-eslint-
```

---

### No Data Model, API Contracts, or Frontend Components

Per user direction: this feature involves GitHub Actions YAML only. No `data-model.md` or `contracts/` directory is required.

### Quickstart

**See**: [quickstart.md](quickstart.md) — how to validate all five fixes.
