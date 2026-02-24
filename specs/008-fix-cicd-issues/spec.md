# Feature Specification: Fix CI/CD Workflow Issues

**Feature Branch**: `008-fix-cicd-issues`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Fix critical and minor CI/CD workflow issues identified during code review of the 007-ci-cd-optimizations branch."

## Clarifications

### Session 2026-02-24

- Q: What mechanism should guard the Snyk SARIF upload step — bash `test -f`, `hashFiles()`, or `steps.<id>.outcome`? → A: `steps.<snyk-step-id>.outcome == 'success'` (native step-outcome expression)
- Q: How is "no regressions" in SC-005 verified — automated CI gate or manual YAML review? → A: All existing workflows must pass on a pull request to `main` (automated CI gate)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tagged Docker Releases Always Publish (Priority: P1)

As a release engineer, when I push a version tag (e.g., `v1.2.3`) to the repository, I expect the Docker image to be built and published to the container registry unconditionally — regardless of which files changed.

**Why this priority**: A missed Docker image publish for a tagged release is the most severe outcome: production deployments could silently reference stale images. This is a correctness failure, not just an efficiency issue.

**Independent Test**: Can be fully tested by pushing a version tag on a commit where none of the path-filtered files changed, and confirming that the `docker-publish` workflow runs and publishes the image.

**Acceptance Scenarios**:

1. **Given** a version tag `v*.*.*` is pushed **and** no Docker-related source files changed, **When** the `docker-publish` workflow is triggered, **Then** the workflow runs to completion and a correctly tagged Docker image is published to the registry.
2. **Given** a version tag `v*.*.*` is pushed **and** Docker-related source files did change, **When** the `docker-publish` workflow is triggered, **Then** the workflow runs to completion and the image is published.
3. **Given** a non-tagged push is made **and** none of the path-filtered files changed, **When** the `docker-publish` workflow evaluates the event, **Then** the workflow does NOT run (path-filter still applies for regular pushes).

---

### User Story 2 - Security Scan Results Upload Reliably (Priority: P2)

As a security engineer, I need the SARIF results from Snyk dependency scans to be uploaded to GitHub Code Scanning reliably. The upload step must not fail the workflow silently when the SARIF file does not exist (e.g., when Snyk itself fails to run).

**Why this priority**: A workflow step that errors on a missing file obscures the real failure (Snyk itself failing) and produces misleading run results in GitHub Actions.

**Independent Test**: Can be tested by deliberately causing the Snyk step to fail and confirming that the subsequent SARIF upload step is skipped rather than erroring with a "file not found" error.

**Acceptance Scenarios**:

1. **Given** the Snyk scan completes successfully and produces `snyk.sarif`, **When** the upload step runs, **Then** the SARIF file is uploaded to GitHub Code Scanning without error.
2. **Given** the Snyk scan fails and does NOT produce `snyk.sarif`, **When** the upload step evaluates its condition, **Then** the upload step is skipped gracefully rather than erroring on a missing file.

---

### User Story 3 - ESLint Cache Hits Consistently Across Branches (Priority: P3)

As a developer, I want the ESLint caching in the lint workflow to have a high cache hit rate across different branches so that linting runs are fast without unnecessary full re-runs.

**Why this priority**: Cache misses on every source file change defeat the purpose of caching the ESLint results file. A well-scoped cache key limited to the ESLint configuration and lockfile, combined with a restore-key fallback, dramatically improves cross-branch cache reuse.

**Independent Test**: Can be tested by making a source file change (not touching `eslint.config.js` or `package-lock.json`) and confirming the ESLint cache is still restored on the next lint run.

**Acceptance Scenarios**:

1. **Given** only application source files changed (not `eslint.config.js` or `package-lock.json`), **When** the lint workflow runs, **Then** the cache key still matches and the previously cached ESLint internal cache is restored.
2. **Given** `eslint.config.js` or `package-lock.json` changes, **When** the lint workflow runs, **Then** a new cache entry is created (cache miss expected).
3. **Given** a branch with no exact cache key match, **When** the lint workflow runs, **Then** a partial cache is restored via the restore-key prefix fallback rather than starting cold.

---

### User Story 4 - Docker Path Filters Reflect Actual Image Content (Priority: P4)

As a maintainer, I want the Docker publish workflow's path filters to only include files that actually affect the Docker image contents, so the workflow is not triggered unnecessarily by irrelevant file changes.

**Why this priority**: Irrelevant triggers waste CI minutes and can cause confusion about why a Docker image was rebuilt when only linting configuration changed.

**Independent Test**: Can be tested by changing only `eslint.config.js` and confirming the `docker-publish` workflow does NOT trigger on a regular (non-tagged) push.

**Acceptance Scenarios**:

1. **Given** only `eslint.config.js` is changed on a non-tagged push, **When** the `docker-publish` workflow evaluates path filters, **Then** the workflow is NOT triggered.
2. **Given** an actual Docker-relevant file (e.g., `Dockerfile`, source code) is changed, **When** the `docker-publish` workflow evaluates path filters, **Then** the workflow IS triggered.

---

### Edge Cases

- What happens when a tag push fires at the same commit as a path-filtered push? Both triggers should be handled independently; the tag trigger always wins for publishing.
- What happens when `snyk.sarif` exists as an empty file (Snyk ran but found nothing)? The upload step should still proceed — the "exists" condition should check file presence, not content.
- What happens if the cache store step fails mid-write on a branch? The restore-key fallback should still pick up the most recent valid cache from a parent branch.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `docker-publish` workflow MUST trigger on any version tag matching `v*.*.*`, unconditionally of which files changed.
- **FR-002**: The `docker-publish` workflow MUST continue to trigger on path-filtered pushes to main/master for non-tagged events, with the path filter applied only to the `push` (non-tag) trigger.
- **FR-003**: The `eslint.config.js` path MUST be removed from the `docker-publish` workflow's path filter list, as ESLint configuration does not affect Docker image contents.
- **FR-004**: The Snyk SARIF upload step in `security.yml` MUST only execute when the preceding Snyk step's outcome is `success`, using a native GitHub Actions step-outcome expression (`steps.<snyk-step-id>.outcome == 'success'`).
- **FR-005**: The ESLint cache key in `lint.yml` MUST be derived only from `eslint.config.js` and `package-lock.json`, not from source files under `src/**`.
- **FR-006**: The ESLint caching step in `lint.yml` MUST include at least one `restore-keys` prefix fallback to allow partial cache restoration across different branches.

### Assumptions

- The workflows reside in the `.github/workflows/` directory and use standard GitHub Actions YAML syntax.
- The Snyk step already has `continue-on-error: true`; only the upload condition needs to change.
- The SARIF upload gate uses `steps.<snyk-step-id>.outcome == 'success'` — a native GitHub Actions step-outcome expression — not `hashFiles()` or a bash `test -f` check.
- No changes to application source code, Dockerfile content, or test logic are required — this is a GitHub Actions YAML-only change.
- The `docker-publish` workflow currently uses a single `push` trigger block with both `tags` and `paths` keys; splitting into two separate trigger entries is the intended fix.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of version-tagged pushes result in a Docker image publish workflow run completing successfully, regardless of which files changed in that commit.
- **SC-002**: The Snyk SARIF upload step produces zero "file not found" failures across all workflow runs where Snyk itself errors.
- **SC-003**: ESLint lint runs that involve only source file changes (no config or lockfile changes) restore from cache at least 90% of the time within the same branch lineage.
- **SC-004**: A change to only `eslint.config.js` does NOT trigger a Docker image build/publish workflow run on a non-tagged push.
- **SC-005**: All five identified issues are resolved and all existing GitHub Actions workflows pass on a pull request to `main` with no new failures introduced.
