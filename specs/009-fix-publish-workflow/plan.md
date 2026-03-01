# Implementation Plan: Fix Deployment Pipeline Vulnerability

**Branch**: `009-fix-publish-workflow` | **Date**: 2026-02-28 | **Spec**: [specs/009-fix-publish-workflow/spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-fix-publish-workflow/spec.md`

## Summary

Resolve the `libpng` heap buffer overflow vulnerability `CVE-2026-25646` blocking the `.github/workflows/docker-publish.yml` CI/CD pipeline. The approach is to transition the Docker base image to `nginx:alpine-slim` to entirely eliminate the vulnerable `libpng` dependency without inline patching, and strip away any legacy workarounds (`.trivyignore`, `apk upgrade`).

## Technical Context

**Language/Version**: N/A (Docker/YAML context)
**Primary Dependencies**: Docker base image `nginx:alpine` -> `nginx:alpine-slim`
**Testing**: Trivy security scanner in GitHub Actions
**Target Platform**: GitHub Actions CI/CD context / Docker Container
**Project Type**: Web Application Containerization
**Performance Goals**: Docker image build times remain consistent or faster since `apk upgrade` cycles will be stripped out and `slim` images are smaller.
**Constraints**: Must strictly eliminate `CVE-2026-25646`.
**Scale/Scope**: CI/CD pipeline infrastructure and Dockerfile.

## Constitution Check

*GATE: Passed*

- **I. Code Quality & Craftsmanship**: Unused assets/ad-hoc legacy patches (`apk upgrade`, `.trivyignore` entries for this CVE) will be removed.
- **II. Testing & Execution Discipline**: Pipeline runs (build, test) must pass locally and in CI. Regression and security scans will naturally test this implementation.
- **IX. Skill-Driven Development**: Adheres closely to `docker-security-hardening` and `docker-multi-stage-optimization` principles by focusing on a minimalistic base footprint to achieve security instead of piling on patches. Commit discipline (50/72 rule, conventional prefixes) is being followed.

## Project Structure

### Documentation (this feature)

```text
specs/009-fix-publish-workflow/
├── plan.md              # This file
├── research.md          # Output
├── data-model.md        # Empty/Not Applicable
├── quickstart.md        # Contextual guide for testing the Docker change
├── tasks.md             # TBD (Phase 2)
```

### Source Code

```text
/
├── Dockerfile                   # The primary target for the image switch and cleanup
├── .trivyignore                 # Clean up legacy skips if present
└── .github/workflows/docker-publish.yml  # Verification target
```

**Structure Decision**: Single repository container definition. Changes are constrained to Docker configurations and CI/CD waiver files.

## Complexity Tracking

No violations. The simplest, most direct fix (`alpine-slim`) was chosen over maintaining brittle package upgrade layers in the Dockerfile.
