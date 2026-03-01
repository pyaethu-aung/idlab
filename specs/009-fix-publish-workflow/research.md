# Phase 0: Research - CVE-2026-25646 Vulnerability Remediation

## Goal
To resolve the `libpng` heap buffer overflow vulnerability `CVE-2026-25646` blocking the GitHub Actions CI pipeline on the package scan stage, while maintaining a lean and efficient application container format. 

## Investigation Focus
- **Component under scrutiny**: Dockerfile base image (`nginx:alpine`), `.trivyignore` workaround file, and any embedded `RUN apk upgrade` workflows used for patching.
- **Constraints**: 100% CI pipeline security validation pass for the given CVE without introducing bloat.

## Summary of Findings & Decisions

### Base Image Switch

- **Decision**: Update the Dockerfile base image.
- **Rationale**: The core `nginx:alpine` image frequently ships with `libpng` due to broader package inclusions standard in the tag. Shifting to `nginx:alpine-slim` fundamentally avoids including the `libpng` graphic utilities in the filesystem entirely. This removes the attack surface altogether, aligning directly with `docker-security-hardening` skills and minimalistic container methodologies.
- **Alternatives considered**: Manually appending `RUN apk del libpng` (brittle and extends build times) or leveraging `RUN apk upgrade --no-cache` (does not guarantee upstream fixes are instantaneous and adds layer bulk). The architectural omission of the dependency is far superior to attempting inline cleanup.

### Workaround Removal

- **Decision**: Delete any explicitly referenced lines in `.trivyignore` for `CVE-2026-25646` and remove any reactive `apk upgrade` patches from the Dockerfile.
- **Rationale**: Relying on the structural strength of a minimized base image is the correct architectural approach. Keeping the old ignore records and patch workarounds creates technical debt and obscures actual remediation strategies.
- **Alternatives considered**: None. Waiving vulnerabilities that can be fundamentally and cleanly removed from the dependencies graph violates best security practices.
