# Research: CI/CD Optimizations

## Decisions

### Trivy Action Version
- **Decision**: Update to `0.34.1`.
- **Rationale**: User explicitly selected this as the nearest stable version.
- **Alternatives considered**: Keeping `@master` (rejected due to supply chain risks).

### Optional Secrets Handling (Snyk)
- **Decision**: Allow pipeline to fail gracefully (`continue-on-error: true`).
- **Rationale**: Selected by user during clarification. Shows failure visibly without blocking PR.

### Build Triggers Path Inclusion
- **Decision**: Include `docker-publish.yml`, `src/**`, `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js`.
- **Rationale**: User explicitly requested these inclusions to prevent redundant container builds on doc updates.
