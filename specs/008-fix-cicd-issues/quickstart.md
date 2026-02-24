# Quickstart: Validating the CI/CD Workflow Fixes

**Branch**: `008-fix-cicd-issues` | **Date**: 2026-02-24
**Scope**: GitHub Actions YAML only — no local build or test tooling required.

---

## Prerequisites

- Push access to the repository (or a fork with Actions enabled)
- A `SNYK_TOKEN` secret configured in the repository (for security.yml validation)
- GitHub CLI (`gh`) is optional but useful for inspecting triggered runs

---

## How to Validate Each Fix

### Fix 1 — Tag trigger always publishes (Critical)

**Scenario**: Push a version tag on a commit that changes NONE of the path-filtered files.

```bash
# 1. Make a change to a file NOT in docker-publish.yml's path filters
#    (e.g., README.md or any docs file)
git checkout 008-fix-cicd-issues
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger tag publish without path match"

# 2. Push the commit + a version tag
git push origin 008-fix-cicd-issues
git tag v99.0.0-test
git push origin v99.0.0-test
```

**Expected**: The `Docker` workflow runs and reaches the "Build and push Docker image" step.
**Failure (pre-fix)**: The workflow would be skipped entirely with no run recorded.

> Clean up: `git push origin --delete v99.0.0-test` after validation.

---

### Fix 2 — SARIF upload skips gracefully when Snyk fails (Medium)

**Scenario**: Cause the Snyk step to fail (e.g., by temporarily removing the `SNYK_TOKEN` secret or pushing a deliberately vulnerable dependency), then inspect the workflow run.

**Expected**: The `Upload Snyk results to GitHub Security tab` step shows status **Skipped**, not **Failed** or **Error**.
**Failure (pre-fix)**: The upload step shows a red ❌ with a "file not found: snyk.sarif" error message.

To inspect a recent security run:
```bash
gh run list --workflow=security.yml --limit=5
gh run view <run-id> --log
```

---

### Fix 3 — ESLint config change doesn't trigger Docker build (Low)

**Scenario**: Push a change that only modifies `eslint.config.js`.

```bash
echo "# test" >> eslint.config.js
git add eslint.config.js
git commit -m "test: eslint config only change"
git push origin 008-fix-cicd-issues
```

**Expected**: Only the `Lint` workflow triggers. The `Docker` workflow does NOT appear in the Actions run list for this push.
**Failure (pre-fix)**: The `Docker` workflow would trigger unnecessarily.

---

### Fix 4 & 5 — ESLint cache restores on source-only changes (Low)

**Scenario**: Push a source file change (not touching `eslint.config.js` or `package-lock.json`).

```bash
# Make a trivial source change
echo "// test" >> src/main.jsx
git add src/main.jsx
git commit -m "test: source only change for cache validation"
git push origin 008-fix-cicd-issues
```

**Expected**:
- `Cache ESLint dependencies` step shows **Cache restored from key: Linux-eslint-<hash>** (exact match)
- If first run on this branch: shows **Cache restored from: Linux-eslint-** (restore-key fallback hit)

**Failure (pre-fix)**: Cache step shows "Cache not found" on every source file change.

---

## Regression Check (SC-005)

Open a PR from `008-fix-cicd-issues` → `main` and confirm all of the following workflow runs pass:

| Workflow | Expected Status |
|----------|----------------|
| `Lint` | ✅ Pass |
| `Docker` | ✅ Pass (build + scan; no push on PR) |
| `Security` | ✅ Pass |
| Any other active workflows | ✅ Pass (no regressions) |

All checks must be green before merging.
