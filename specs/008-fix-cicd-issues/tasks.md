# Tasks: Fix CI/CD Workflow Issues

**Input**: Design documents from `/specs/008-fix-cicd-issues/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | quickstart.md ✅

**Tests**: No unit test tasks — this feature is GitHub Actions YAML only. Validation is performed by opening a PR to `main` and verifying all CI runs pass (SC-005). Each fix has a manual validation scenario documented in `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. All tasks are small, discrete YAML edits; most can be applied in one editing session but are kept separate for clean, attributable commits per the Constitution's commit discipline.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the working branch and files are in the expected state before editing.

- [x] T001 Verify branch is `008-fix-cicd-issues` and all three workflow files match the pre-fix state documented in plan.md

> No project init, no dependency install, no tooling config — YAML-only scope.

---

## Phase 2: Foundational (Blocking Prerequisites)

> **No foundational phase required.** All four user stories are independent YAML edits touching separate concerns. US1 and US4 both edit `docker-publish.yml` but target non-overlapping sections (`on:` trigger block vs. `paths:` list), so they must be applied sequentially in the same file to avoid merge conflicts. No other cross-story dependency exists.

**⚠️ NOTE**: US1 and US4 both modify `.github/workflows/docker-publish.yml`. Apply US1 first (trigger block), then US4 (path list cleanup) in sequence. US2 and US3 are fully independent.

---

## Phase 3: User Story 1 — Tagged Docker Releases Always Publish (Priority: P1) 🎯 MVP

**Goal**: Ensure any `v*.*.*` tag push triggers the Docker workflow unconditionally, regardless of which files changed.

**Independent Test**: Push a version tag on a commit that changes only `README.md` (not in path filters) and confirm the `Docker` workflow run appears and completes. See `quickstart.md` § Fix 1.

### Implementation for User Story 1

- [x] T002 [US1][US4] In `.github/workflows/docker-publish.yml`, split the `on.push` block into two separate `push:` entries: one with `branches: ["main"]` and `paths:` (retaining the existing path list minus `eslint.config.js`), and one with `tags: ["v*.*.*"]` and no `paths:` key *(also satisfies FR-003/US4 for `push.paths`; `pull_request.paths` is completed by T007)*

  **⚠️ Pre-flight — verify duplicate push key behaviour before editing the production workflow**: Create a throwaway branch with a minimal test workflow containing two `push:` entries and confirm both triggers fire independently. If GitHub Actions only honours the last `push:` key, use the `release: [published]` event for the tag trigger instead:

  ```yaml
  # Alternative if duplicate push keys are not supported:
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
    release:
      types: [ published ]
  ```
  > If using the `release` alternative: update the Cosign signing step `if:` condition from `startsWith(github.ref, 'refs/tags/')` to `github.event_name == 'release'`.

  **Exact change** — replace the current `on.push` block (lines 3–14):
  ```yaml
  # BEFORE
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

  # AFTER
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

  > Note: `eslint.config.js` is intentionally omitted from the branch-push paths (addresses US4/Fix 3 simultaneously in this block).

**Checkpoint**: After T002, a tag push on a no-path-match commit must trigger the Docker workflow. Validate per `quickstart.md` § Fix 1 before proceeding.

---

## Phase 4: User Story 2 — Security Scan Results Upload Reliably (Priority: P2)

**Goal**: The SARIF upload step in `security.yml` must skip gracefully when Snyk fails, rather than erroring on a missing file.

**Independent Test**: Cause the Snyk step to fail (e.g., revoke `SNYK_TOKEN`) and confirm the upload step shows **Skipped**, not **Failed**. See `quickstart.md` § Fix 2.

### Implementation for User Story 2

- [x] T003 [US2] In `.github/workflows/security.yml`, add `id: snyk` to the "Run Snyk vulnerability scanner" step (line 53)

  ```yaml
  # BEFORE
      - name: Run Snyk vulnerability scanner
        uses: snyk/actions/node@v1.0.0

  # AFTER
      - name: Run Snyk vulnerability scanner
        id: snyk
        uses: snyk/actions/node@v1.0.0
  ```

- [x] T004 [US2] In `.github/workflows/security.yml`, replace `if: always()` on the "Upload Snyk results" step (line 73) with `if: steps.snyk.outcome == 'success'`

  ```yaml
  # BEFORE
        if: always()

  # AFTER
        if: steps.snyk.outcome == 'success'
  ```

**Checkpoint**: After T003–T004, the upload step must skip when Snyk errors. Validate per `quickstart.md` § Fix 2.

---

## Phase 5: User Story 3 — ESLint Cache Hits Consistently Across Branches (Priority: P3)

**Goal**: ESLint cache key hashes only `eslint.config.js` and `package-lock.json`; a `restore-keys` prefix fallback enables cross-branch cache reuse.

**Independent Test**: Push a source-file-only change and confirm the `Cache ESLint dependencies` step restores from cache (exact match or restore-key fallback). See `quickstart.md` § Fix 4 & 5.

### Implementation for User Story 3

- [x] T005 [US3] In `.github/workflows/lint.yml`, remove `'src/**'` from the `hashFiles()` call in the `key:` of the `Cache ESLint dependencies` step (line 49)

  ```yaml
  # BEFORE
            key: ${{ runner.os }}-eslint-${{ hashFiles('eslint.config.js', 'package-lock.json', 'src/**') }}

  # AFTER
            key: ${{ runner.os }}-eslint-${{ hashFiles('eslint.config.js', 'package-lock.json') }}
  ```

- [x] T006 [US3] In `.github/workflows/lint.yml`, add a `restore-keys:` field immediately after the `key:` line in the `Cache ESLint dependencies` step

  ```yaml
  # AFTER (full cache step — lines 45–52 result):
        - name: Cache ESLint dependencies
          uses: actions/cache@v4
          with:
            path: .eslintcache
            key: ${{ runner.os }}-eslint-${{ hashFiles('eslint.config.js', 'package-lock.json') }}
            restore-keys: |
              ${{ runner.os }}-eslint-
  ```

**Checkpoint**: After T005–T006, source-only pushes must restore from the ESLint cache. Validate per `quickstart.md` § Fix 4 & 5.

---

## Phase 6: User Story 4 — Docker Path Filters Reflect Actual Image Content (Priority: P4)

**Goal**: `eslint.config.js` must be removed from `docker-publish.yml`'s `pull_request.paths` filter (already removed from `push.paths` in T002).

**Independent Test**: Push a change to `eslint.config.js` on a non-tagged branch and confirm the `Docker` workflow does NOT trigger. See `quickstart.md` § Fix 3.

### Implementation for User Story 4

- [ ] T007 [US4] In `.github/workflows/docker-publish.yml`, remove `- "eslint.config.js"` from the `pull_request.paths` filter list (currently the last entry in that block)

  ```yaml
  # BEFORE
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

  # AFTER
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

  > `eslint.config.js` was already removed from `push.paths` as part of T002. This task completes the cleanup for `pull_request.paths`.

**Checkpoint**: After T007, an `eslint.config.js`-only change must not trigger Docker workflow. Validate per `quickstart.md` § Fix 3.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation pass across all three workflow files before opening PR.

- [ ] T008 [P] Lint all three modified workflow files for YAML syntax validity (e.g., `yamllint .github/workflows/docker-publish.yml .github/workflows/security.yml .github/workflows/lint.yml` or equivalent)
- [ ] T009 Open a PR from `008-fix-cicd-issues` → `main` and confirm all existing GitHub Actions workflows pass (SC-005 regression gate) per `quickstart.md` § Regression Check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Phases 3–6**: No blocking foundational phase; all user story work can begin after T001
  - **US1 (Phase 3)** and **US4 (Phase 6)** both modify `docker-publish.yml` — apply Phase 3 first, then Phase 6 sequentially
  - **US2 (Phase 4)** and **US3 (Phase 5)** are fully independent — can run in parallel with each other and with US4 after US1 is complete
- **Polish (Phase 7)**: Depends on all story phases complete

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|----------------------|
| US1 (P1) | T001 only | — (do first; US4 shares same file) |
| US2 (P2) | T001 only | US3, US4 |
| US3 (P3) | T001 only | US2, US4 |
| US4 (P4) | T002 (US1 must apply first in docker-publish.yml) | US2, US3 |

### Within Each User Story

- T003 → T004 (must add `id: snyk` before referencing `steps.snyk.outcome`)
- T005 → T006 (edit same cache step sequentially)
- All other tasks are single-step edits with no internal ordering constraint

### Parallel Opportunities

```bash
# After T001 (branch verification):

# Stream A — docker-publish.yml (sequential, same file):
T002 (US1: split push trigger)
T007 (US4: remove eslint from pull_request.paths)

# Stream B — security.yml (parallel with Stream A):
T003 → T004 (US2: add id + fix if condition)

# Stream C — lint.yml (parallel with Streams A and B):
T005 → T006 (US3: narrow key + add restore-keys)

# After all streams complete:
T008 (YAML lint all files)
T009 (open PR, validate CI gate)
```

---

## Implementation Strategy

### MVP First (User Story 1 — Critical Fix Only)

1. Complete Phase 1: T001
2. Complete Phase 3: T002 (tag trigger separation)
3. **STOP and VALIDATE**: push a test tag with no path-filter match, confirm Docker workflow runs
4. Continue to remaining stories

### Full Delivery (All 5 Fixes)

1. T001 → T002 → T007 (Stream A — docker-publish.yml)
2. T003 → T004 (Stream B — security.yml, parallel)
3. T005 → T006 (Stream C — lint.yml, parallel)
4. T008 → T009 (final validation and PR)

### Solo Developer Strategy

Apply in this order for clean, bisectable commits:

| Commit | Task(s) | Files |
|--------|---------|-------|
| 1 | T002 | docker-publish.yml (tag trigger split + push path cleanup) |
| 2 | T007 | docker-publish.yml (pull_request path cleanup) |
| 3 | T003, T004 | security.yml (SARIF guard) |
| 4 | T005, T006 | lint.yml (cache key + restore-keys) |
| 5 | T008, T009 | Validation + PR |

---

## Notes

- [P] tasks = different files, no content dependencies
- [Story] label maps each task to its user story for traceability
- No `npm run test / lint / build` required locally. **Constitution § VI exception applies**: this feature modifies only `.github/workflows/` YAML files; there is no npm build artifact to validate. Per the exception clause ("If the build cannot run, document the blocker and perform a local smoke run"), `yamllint` via T008 serves as the equivalent local smoke run. All other validation is performed by the PR CI gate (T009).
- Commits must follow the 50/72 rule with conventional commit prefixes (`fix:`, `ci:`) per Constitution § Commit Discipline
- Each commit must represent exactly one complete, testable fix
- Do not combine US1 and US4 changes into a single commit — they are separate acceptance criteria
