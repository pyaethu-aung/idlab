# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the specific YAML modifications required across the GitHub Actions workflows (`deploy.yml`, `lint.yml`, `security.yml`, `docker-publish.yml`) to improve pipeline stability, security, maintainability, and execution time. This includes pinning versions, establishing a centralized Node version via `.nvmrc`, enforcing concurrency cancelations, applying job timeouts, and conditionally executing heavy container builds.

## Technical Context

**Language/Version**: Node.js 20 (via `.nvmrc`)
**Primary Dependencies**: GitHub Actions, Trivy, Snyk, CodeQL, ESLint, npm
**Target Platform**: GitHub Actions CI/CD (Ubuntu runners), GitHub Container Registry
**Project Type**: Web Application
**Performance Goals**: Reduce CI execution minutes, speed up PR feedback by cancelling redundant runs and using lint caches, skip unnecessary multi-arch loads during Trivy scans.
**Constraints**: Must fail non-blocking on optional security tokens (Snyk `allow-failure`), deploy must only happen after successful linting, all workflows capped at 15 minutes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: Eliminates hardcoded duplicate configs (Node version) in favor of `.nvmrc`. Maintains idiomatic GitHub Actions patterns.
- **II. Testing & Execution Discipline**: Enforces that linting (validation) occurs before deployment, adhering to the "must pass CI before merge/deploy" principle.
- **IV. Performance Requirements**: Drastically optimizes CI performance (caching, concurrency, timeouts, triggered path filters).

There are no constitution violations in this infrastructure-level plan.

## Project Structure

### Documentation (this feature)

```text
specs/007-ci-cd-optimizations/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Root Configuration
.nvmrc                       # [NEW] Single source of truth for Node.js version (20)

# GitHub Actions Workflows
.github/workflows/
├── deploy.yml               # [MODIFIED] Timeouts, nvmrc, pre-build lint
├── docker-publish.yml       # [MODIFIED] Version pinning, timeouts, path filters, optimized scan
├── lint.yml                 # [MODIFIED] Concurrency, cache, nvmrc, timeouts, main branch trigger
└── security.yml             # [MODIFIED] Version pinning, concurrency, CodeQL v4, Snyk continue-on-error, nvmrc
```

**Structure Decision**: The changes are strictly constrained to the CI/CD pipeline definition files located in `.github/workflows/` and the addition of a centralized `.nvmrc` configuration file in the repository root.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Proposed Changes

### Configuration Updates

#### [NEW] .nvmrc

- Create `.nvmrc` in the repository root containing the value `20`.

#### [MODIFY] package.json

- Ensure `package.json` testing/linting scripts work securely and natively.

### GitHub Actions Workflows

#### [MODIFY] .github/workflows/security.yml

- **Action Version Pinning**: Update Snyk action to `snyk/actions/node@v1.0.0`.
- **CodeQL Upgrade**: Update `github/codeql-action/upload-sarif@v3` to `v4`.
- **Concurrency**: Add concurrency control to cancel in-progress runs for the same branch/PR, e.g., `group: ${<!-- -->{ github.workflow }}-${<!-- -->{ github.ref }}`.
- **Job Timeout**: Add `timeout-minutes: 15` at the job level.
- **Graceful Failure**: Update the Snyk step to use `continue-on-error: true` (which it already has) and ideally an `if: env.SNYK_TOKEN != ''` condition if secrets exist or are optional. But as per clarification, we should rely on `continue-on-error: true`. Actually, the spec says "attempt vulnerability scans even when required environment secrets are absent, but properly configure them to allow failure".
- **Node.js Centralization**: Update `actions/setup-node` to use `node-version-file: '.nvmrc'` instead of hardcoded `20`.

#### [MODIFY] .github/workflows/docker-publish.yml

- **Action Version Pinning**: Update Trivy action to `aquasecurity/trivy-action@master`'s nearest stable `0.34.1` (or `0.28.0` etc. We will use `0.34.1`).
- **Job Timeout**: Add `timeout-minutes: 15` at the job level.
- **Build Triggers**: Add `paths` filter for `push` and `pull_request` including: `.github/workflows/docker-publish.yml`, `src/**`, `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js`.
- **Multi-Arch Optimization**: Optimize the build architecture by directly using `docker buildx` with `--load` natively for Trivy, or using `tar` export.

#### [MODIFY] .github/workflows/lint.yml

- **Concurrency**: Add concurrency control.
- **Job Timeout**: Add `timeout-minutes: 15`.
- **Main Branch Trigger**: Add `push` with `branches: ["main"]` to calculate populated caches on direct pushes.
- **ESLint Caching**: 
  - Add `actions/cache` step before `npm run lint` prioritizing `.eslintcache`.
  - Ensure the `npm run lint` step caches correctly.
- **Node.js Centralization**: Use `node-version-file: '.nvmrc'`.

#### [MODIFY] .github/workflows/deploy.yml

- **Validation Validation**: Add dependency on `lint` passing by either keeping `run: npm run lint` before build (which is already there) or making it a separate job. Since it already enforces validation sequentially in the same job, we will ensure it remains robust. We will add `needs: lint` if we split, but keeping sequential steps is fine.
- **Job Timeout**: Add `timeout-minutes: 15`.
- **Node.js Centralization**: Use `node-version-file: '.nvmrc'`.

## Verification Plan

### Automated Tests

- N/A since this is pure CI/CD modification. We will use GitHub Actions.

### Manual Verification

- Observe GitHub Actions runs for a PR to ensure:
  - Jobs are correctly canceled when a new commit is pushed.
  - Snyk step doesn't block merges if token is missing.
  - ESLint caching is hitting correctly in `lint.yml` (saving time).
  - Workflows use `.nvmrc` successfully without errors.
  - CodeQL runs without V3 deprecation warning.
