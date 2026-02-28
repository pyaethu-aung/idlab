# PR Title
feat(docker-security): resolve CVE-2026-25646 via alpine-slim

## Description
Resolves the `libpng` heap buffer overflow vulnerability (`CVE-2026-25646`) that was causing the `.github/workflows/docker-publish.yml` CI pipeline to fail during the image scanning stage. Instead of masking the vulnerability, this branch implements a strictly structural fix by shifting the container architecture to a minimized baseline footprint.

## Change Summary
- **Base Image Upgrade:** Transitioned the Dockerfile base image from `nginx:alpine` to `nginx:alpine-slim` to fundamentally avoid the vulnerable `libpng` dependency altogether.
- **Removed Waivers:** Eradicated legacy security workarounds including `.trivyignore` component exemptions and reactive `apk upgrade` shell execution cycles from the container configuration. Also stripped the missing `.trivyignore` reference from the Trivy action to prevent pipeline runner errors.
- **Improved Triggers:** Added `Dockerfile` and `.dockerignore` to the `docker-publish.yml` push and pull request triggers so container modifications effectively trigger validation.

## Requirement Traceability
- **FR-002 / SC-002:** Minimal application footprint utilized strictly removing `libpng` presence. Trivy scanning locally confirmed 0 critical items.
- **FR-006:** `.trivyignore` removed entirely from the repository and inline patches bypassed.

## Validation & Constitution
- [x] Adheres strictly to **Constitution Principle VI (Execution Discipline)**: Local runs of `npm run build`, `npm run test` (all 75 tasks passing), and `npm run lint` succeeded prior to any final image construction.
- [x] Local `docker build` constructed without legacy failures.
- [x] Local manual `trivy image` scan returned `0 critical vulnerabilities`.

Ready for code review and automated remote CI execution!
