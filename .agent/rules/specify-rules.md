# uuid-generator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-20

## Active Technologies
- Node.js 20 (to be centralized in `.nvmrc`) + GitHub Actions, Vite, React (testing via Vitest) (007-ci-cd-optimizations)
- GitHub Actions workflow YAML (schema v2) + `actions/cache@v4`, `snyk/actions/node@v1.0.0`, `github/codeql-action/upload-sarif@v4`, `docker/build-push-action@v5` (008-fix-cicd-issues)
- N/A (Docker/YAML context) + Docker base image `nginx:alpine` -> `nginx:alpine-slim` (009-fix-publish-workflow)

- JavaScript (React + Vite) + React, TailwindCSS, Vanilla CSS (for custom variables) (005-enhanced-hero-design)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (React + Vite): Follow standard conventions

## Recent Changes
- 009-fix-publish-workflow: Added N/A (Docker/YAML context) + Docker base image `nginx:alpine` -> `nginx:alpine-slim`
- 008-fix-cicd-issues: Added GitHub Actions workflow YAML (schema v2) + `actions/cache@v4`, `snyk/actions/node@v1.0.0`, `github/codeql-action/upload-sarif@v4`, `docker/build-push-action@v5`
- 008-fix-cicd-issues: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
