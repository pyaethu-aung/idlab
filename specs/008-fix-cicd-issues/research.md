# Research: Fix CI/CD Workflow Issues

**Branch**: `008-fix-cicd-issues` | **Date**: 2026-02-24
**Phase**: 0 — Resolve all design decisions before implementation

No NEEDS CLARIFICATION items remain. All five decisions below were derived from the spec, clarify session, and the `docker-cicd-integration` skill.

---

## Decision 1: Tag Trigger Separation Mechanism

**Question**: How should the `docker-publish.yml` tag trigger be separated from the path-filtered branch push trigger?

**Decision**: Use two separate `push:` entries inside the `on:` block — one for branch pushes (with `paths`), one for tag pushes (without `paths`).

**Rationale**: GitHub Actions processes `on:` event entries additively. The `push.tags` entry with no `paths` key triggers unconditionally on any matching tag, satisfying FR-001. The `push.branches` entry retains its `paths` filter for non-tagged events (FR-002). This is the minimal structural change with no behaviour side-effects on other triggers.

**Alternatives considered**:
- Use a `release` event instead of `push.tags` — rejected: changes event semantics (requires a published GitHub Release, not just a git tag); breaks Cosign signing and metadata-action tag extraction patterns already in use.
- Remove `paths` entirely from the `push` block — rejected: would trigger Docker builds on every commit to `main`, wasting CI minutes and violating the intent of the path filter.
- Move path filtering to a job-level `if:` condition — rejected: GitHub Actions has no runtime `paths_changed()` function; this would require a separate preliminary job, adding unnecessary complexity.

---

## Decision 2: SARIF Upload Guard Expression

**Question**: What expression should guard the Snyk SARIF upload step to prevent a "file not found" error when Snyk fails?

**Decision**: Add `id: snyk` to the Snyk scanner step and change the upload step's `if:` condition to `steps.snyk.outcome == 'success'`.

**Rationale**: The step-outcome expression is idiomatic GitHub Actions — it gates the upload on whether the Snyk step actually succeeded, which is the true proxy for SARIF file existence. It requires zero filesystem operations and is evaluated before the step runs. Confirmed in the `/speckit.clarify` session (Q1 answer: Option B).

**Alternatives considered**:
- `hashFiles('snyk.sarif') != ''` — rejected: `hashFiles()` is evaluated at workflow parse time, not at step runtime, so it cannot dynamically check whether a file was produced during the run.
- Bash `test -f snyk.sarif` inside `if:` — rejected: while functional, it requires a shell evaluation context not natively available in step-level `if:` expressions; would need a separate `run:` step to set an output variable, adding unnecessary complexity.
- Keep `if: always()` but add a pre-check step — rejected: adds steps and noise; the outcome expression solves this cleanly in one attribute change.

---

## Decision 3: ESLint Cache Key Scope

**Question**: Which files should be hashed to form the ESLint cache key?

**Decision**: Hash only `eslint.config.js` and `package-lock.json`. Remove `src/**` from the hash inputs.

**Rationale**: The ESLint cache key controls when the `.eslintcache` file (ESLint's own internal per-file cache) is discarded and repopulated. ESLint's internal cache already tracks which source files have changed and re-lints only those. Hashing `src/**` in the Actions cache key means a new cache entry is created on every source file change, defeating the purpose of caching the `.eslintcache` file entirely. The correct invalidation signals are: ESLint rule changes (`eslint.config.js`) and dependency changes (`package-lock.json`).

**Alternatives considered**:
- Hash `src/**` in addition — rejected: this is the current bug; source file changes should be handled by ESLint's own cache, not by busting the Actions cache.
- Hash only `package-lock.json` — rejected: would not bust the cache when ESLint rules change, potentially reusing stale lint results.

---

## Decision 4: `restore-keys` Prefix Strategy

**Question**: What `restore-keys` prefix should be used for the ESLint cache step?

**Decision**: Single prefix `${{ runner.os }}-eslint-`.

**Rationale**: This prefix matches any previously stored ESLint cache for the same OS, regardless of branch or config hash. When an exact key miss occurs (e.g., first run on a new branch, or after `eslint.config.js` changes), Actions falls back to the most recent cache entry with this prefix. ESLint's internal cache then handles per-file re-linting on top of the partially restored state, keeping the overall lint run faster than a cold start. A single prefix level is sufficient; deeper prefixes would reduce the fallback hit rate without meaningful benefit.

**Alternatives considered**:
- No `restore-keys` (current state) — rejected: this is the bug; cold starts on every new branch or config change.
- Multiple restore-key levels (e.g., `${{ runner.os }}-eslint-${{ github.ref_name }}-`) — rejected: overly narrow; would not restore cache across branches and fails the cross-branch hit rate goal (SC-003).

---

## Decision 5: `eslint.config.js` Removal from Docker Path Filters

**Question**: Should `eslint.config.js` be removed from `docker-publish.yml`'s path filters?

**Decision**: Yes — remove from both `push.paths` and `pull_request.paths`.

**Rationale**: ESLint configuration affects only the linting step, which runs in `lint.yml`. It has no effect on the Dockerfile build, the resulting image contents, or any runtime behaviour of the container. Including it as a Docker workflow trigger wastes CI minutes on Docker builds triggered by lint-config-only changes and creates confusion about what the Docker workflow is responsible for. The `lint.yml` workflow already triggers on `eslint.config.js` changes.

**Alternatives considered**:
- Keep `eslint.config.js` in paths but mark it as a known false positive — rejected: the correct fix is removal; documentation cannot prevent wasted CI runs.
