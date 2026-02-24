# fix: resolve CI/CD workflow issues from code review

## Summary

Addresses five CI/CD workflow issues (1 critical, 1 medium, 3 low) identified during code review of the `007-ci-cd-optimizations` branch. Changes are confined to `.github/workflows/` YAML files only — no application code, Dockerfile content, or test logic was modified.

## Changes

### Critical

- **`docker-publish.yml`** — Separated the version-tagged release trigger from the path-filtered push trigger. Previously, `tags` and `paths` were combined under a single `push` event, causing GitHub Actions to AND both conditions — silently skipping tagged releases when no listed file changed. Replaced with a dedicated `release: [published]` event that fires unconditionally. Updated the Docker push and Cosign signing conditions to support the new event.

### Medium

- **`security.yml`** — Gated the Snyk SARIF upload step on the scanner's actual outcome. The Snyk step has `continue-on-error: true`, so `if: always()` on the upload would attempt to upload a non-existent `snyk.sarif` file when Snyk fails. Changed to `if: steps.snyk.outcome == 'success'`, which correctly skips the upload when no file was produced.

### Low / Minor

- **`docker-publish.yml`** — Removed `eslint.config.js` from both `push.paths` and `pull_request.paths` filters. ESLint configuration changes do not affect Docker image contents and should not trigger Docker builds.
- **`lint.yml`** — Narrowed the ESLint cache key from `hashFiles('eslint.config.js', 'package-lock.json', 'src/**')` to `hashFiles('eslint.config.js', 'package-lock.json')`. Source file changes were unnecessarily busting the Actions cache on every commit; ESLint's own internal `.eslintcache` already tracks per-file state.
- **`lint.yml`** — Added `restore-keys: ${{ runner.os }}-eslint-` as a prefix fallback to enable cross-branch cache restoration, improving hit rates on new branches and after config changes.

## Files Modified

| File | Lines | Description |
|------|:-----:|-------------|
| `.github/workflows/docker-publish.yml` | +3 / −5 | Tag trigger separation + eslint path removal |
| `.github/workflows/security.yml` | +2 / −1 | SARIF upload guard |
| `.github/workflows/lint.yml` | +3 / −1 | Cache key scope + restore-keys |

## Requirements Satisfied

| ID | Requirement | Status |
|----|------------|:------:|
| FR-001 | Tag push triggers Docker workflow unconditionally | ✅ |
| FR-002 | Branch push retains path-filtered trigger | ✅ |
| FR-003 | `eslint.config.js` removed from Docker path filters | ✅ |
| FR-004 | SARIF upload gated on Snyk step outcome | ✅ |
| FR-005 | ESLint cache key hashes only config + lockfile | ✅ |
| FR-006 | `restore-keys` prefix fallback present | ✅ |

## Testing / Validation

- All three workflow files validated for YAML syntax via `js-yaml`
- Detailed validation scenarios documented in `specs/008-fix-cicd-issues/quickstart.md`
- PR CI regression gate confirms no existing workflows are broken

## Commits

| Hash | Message |
|------|---------|
| `733591b` | fix(cicd-issues): separate tag trigger from path-filtered push |
| `7d15650` | fix(cicd-issues): gate SARIF upload on Snyk success |
| `bca9b34` | ci(cicd-issues): optimize ESLint caching strategy |
| `db24312` | fix(cicd-issues): remove eslint config from PR path filters |
| `cd32277` | fix(cicd-issues): final polish and workflow validation |
| `b52c23e` | docs(cicd-issues): mark spec as implemented |

## Spec Artifacts

- [`spec.md`](specs/008-fix-cicd-issues/spec.md) — Feature specification
- [`plan.md`](specs/008-fix-cicd-issues/plan.md) — Implementation plan
- [`tasks.md`](specs/008-fix-cicd-issues/tasks.md) — Task breakdown (all complete)
- [`research.md`](specs/008-fix-cicd-issues/research.md) — Design decisions
- [`quickstart.md`](specs/008-fix-cicd-issues/quickstart.md) — Validation guide
