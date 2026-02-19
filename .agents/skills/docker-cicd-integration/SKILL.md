---
name: docker-cicd-integration
description: Integrate Docker builds, testing, and deployment into CI/CD pipelines. Use when asked to "add Docker to CI/CD", "automate Docker builds", "setup container deployment", or "configure Docker in GitHub Actions".
metadata:
  author: custom
  version: "2.0.0"
  argument-hint: <ci-platform>
---

# Docker CI/CD Integration Skill

Comprehensive guide for integrating Docker into CI/CD pipelines, tailored to this project's architecture: a **React + Vite SPA** served by **Nginx** in a multi-stage Docker build, published to **GitHub Container Registry (GHCR)**.

## Project Context

| Aspect | Detail |
|--------|--------|
| **App type** | React + Vite single-page application |
| **Dockerfile** | 2-stage: `node:20-alpine` (builder) → `nginx:alpine` (runtime) |
| **Nginx config** | `.docker/nginx.conf` with security headers, gzip, SPA routing, `/health` endpoint |
| **Non-root user** | `app` (UID 1000) |
| **Runtime port** | 80 (Nginx) |
| **Registry** | `ghcr.io` (GitHub Container Registry) |
| **Signing** | Cosign keyless signing via Sigstore/Fulcio |
| **Scanning** | Trivy (image) + Hadolint (Dockerfile) |
| **Push strategy** | Only on semver tags (`v*.*.*`) |
| **Platforms** | `linux/amd64`, `linux/arm64` |
| **Static deployment** | GitHub Pages (separate workflow) |

## What This Skill Does

1. **CI/CD Pipeline Setup**
   - Configures automated Docker builds for a static SPA
   - Implements multi-platform builds (amd64/arm64)
   - Sets up semver-based image tagging
   - Manages GHCR integration with Cosign image signing

2. **Automated Testing & Scanning**
   - Hadolint Dockerfile linting
   - Trivy vulnerability scanning (build-then-scan pattern)
   - `.trivyignore` for known unfixable CVEs
   - npm audit / Snyk for dependency scanning (separate workflow)

3. **Security Integration**
   - Cosign keyless image signing on tag pushes
   - Trivy scan gates (`exit-code: 1` on CRITICAL/HIGH)
   - Read-only container runtime with `--cap-drop ALL`

4. **Deployment**
   - Tag-based Docker image publishing to GHCR
   - GitHub Pages deployment for the static site (separate workflow)

## Current CI/CD Pipeline

The project's actual workflow is `.github/workflows/docker-publish.yml`:

```yaml
name: Docker

on:
  push:
    branches: [ "main" ]
    tags: [ 'v*.*.*' ]
  pull_request:
    branches: [ "main" ]
  schedule:
    - cron: '35 6 * * *'

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write  # Required for Cosign keyless signing

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Lint the Dockerfile
      - name: Run Hadolint
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile

      # Install Cosign for image signing (skip on PRs)
      - name: Install cosign
        if: github.event_name != 'pull_request'
        uses: sigstore/cosign-installer@v3.5.0
        with:
          cosign-release: 'v2.2.4'

      # QEMU for multi-platform builds
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Setup Docker buildx
        uses: docker/setup-buildx-action@v3

      # Login to GHCR (skip on PRs)
      - name: Log into registry ${{ env.REGISTRY }}
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # Extract semver tags from git tags
      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            type=sha

      # Build and load locally for Trivy scan
      - name: Build and load Docker image for scan
        uses: docker/build-push-action@v5
        with:
          context: .
          load: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Scan for vulnerabilities before pushing
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: '${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'
          trivyignores: .trivyignore

      # Multi-platform build and push (only on tags)
      - name: Build and push Docker image
        id: build-and-push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: ${{ startsWith(github.ref, 'refs/tags/') }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Cosign keyless signing (only on tags)
      - name: Sign the published Docker image
        if: ${{ startsWith(github.ref, 'refs/tags/') }}
        env:
          TAGS: ${{ steps.meta.outputs.tags }}
          DIGEST: ${{ steps.build-and-push.outputs.digest }}
        run: echo "${TAGS}" | xargs -I {} cosign sign --yes {}@${DIGEST}
```

## Image Tagging Strategy

This project uses **semver tags only** (no branch-based latest tags):

```yaml
- name: Docker metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
    tags: |
      # Semantic versioning from git tags
      type=semver,pattern={{version}}    # e.g., 1.2.3
      type=semver,pattern={{major}}.{{minor}}  # e.g., 1.2
      type=semver,pattern={{major}}       # e.g., 1
      # Git SHA for traceability
      type=sha
```

### Tag Examples
- `v1.2.3` → Tags: `1.2.3`, `1.2`, `1`, `sha-a1b2c3d`
- `main` branch push → Build + scan only, no push
- PR → Build + scan only, no push

## Security Scanning Workflow

The project also has a separate npm dependency security workflow at `.github/workflows/security.yml`:

```yaml
name: Security

on:
  push:
    branches: [main]
    paths:
      - "package.json"
      - "package-lock.json"
  pull_request:
    branches: [main]
    paths:
      - "package.json"
      - "package-lock.json"
  schedule:
    - cron: "0 2 * * 0"  # Weekly on Sunday at 2 AM

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - name: Run Snyk vulnerability scanner
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high --sarif-file-output=snyk.sarif
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true
      - name: Upload Snyk results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: snyk.sarif
        if: always()
```

## Container Registry: GHCR

This project uses GitHub Container Registry exclusively:

```yaml
- name: Log into GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

## Testing the Docker Image Locally

Use the npm scripts defined in `package.json`:

```bash
# Build the image
npm run docker:build
# → docker build -t uuid-generator:local .

# Run with security hardening
npm run docker:run
# → docker run --rm -p 8080:80 --name uuid-app \
#     --read-only --cap-drop ALL \
#     --tmpfs /var/cache/nginx:mode=1777 \
#     --tmpfs /var/run:mode=1777 \
#     --tmpfs /tmp:mode=1777 \
#     uuid-generator:local

# Test health endpoint
curl http://localhost:8080/health
# → OK
```

## Container Health Verification

The health check is handled by Nginx at the `/health` endpoint (defined in `.docker/nginx.conf`), not by a `HEALTHCHECK` instruction in the Dockerfile:

```nginx
location /health {
    access_log off;
    return 200 'OK';
    add_header Content-Type text/plain;
}
```

To verify in CI:
```yaml
- name: Verify container health
  run: |
    docker run -d --name test-app -p 8080:80 \
      --read-only --cap-drop ALL \
      --tmpfs /var/cache/nginx:mode=1777 \
      --tmpfs /var/run:mode=1777 \
      --tmpfs /tmp:mode=1777 \
      ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
    
    timeout 15s bash -c 'until curl -sf http://localhost:8080/health; do sleep 1; done'
    
    docker stop test-app
    docker rm test-app
```

## Cosign Image Signing

This project uses **keyless signing** with Sigstore/Fulcio (no private key required):

```yaml
# Install Cosign
- name: Install cosign
  uses: sigstore/cosign-installer@v3.5.0

# Sign after push (uses OIDC identity from GitHub Actions)
- name: Sign the published Docker image
  if: ${{ startsWith(github.ref, 'refs/tags/') }}
  env:
    TAGS: ${{ steps.meta.outputs.tags }}
    DIGEST: ${{ steps.build-and-push.outputs.digest }}
  run: echo "${TAGS}" | xargs -I {} cosign sign --yes {}@${DIGEST}
```

To verify a signed image:
```bash
cosign verify ghcr.io/pyaethu-aung/uuid-generator:1.0.0 \
  --certificate-identity-regexp="https://github.com/pyaethu-aung/uuid-generator" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```

## GitHub Pages Deployment

The static site is also deployed to GitHub Pages via `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - "src/**"
      - "index.html"
      - "package.json"
      - "package-lock.json"
      - "vite.config.js"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

## Makefile Docker Targets (Recommended Addition)

The current `Makefile` only has npm targets. To add Docker targets:

```makefile
.PHONY: docker-build docker-run docker-scan docker-clean

IMAGE_NAME := uuid-generator
TAG := local

docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) .

docker-run:
	docker run --rm -p 8080:80 --name uuid-app \
		--read-only --cap-drop ALL \
		--tmpfs /var/cache/nginx:mode=1777 \
		--tmpfs /var/run:mode=1777 \
		--tmpfs /tmp:mode=1777 \
		$(IMAGE_NAME):$(TAG)

docker-scan:
	trivy image $(IMAGE_NAME):$(TAG)
	hadolint Dockerfile

docker-clean:
	docker rmi $(IMAGE_NAME):$(TAG) 2>/dev/null || true
```

## References

- [GitHub Actions for Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Trivy Action](https://github.com/aquasecurity/trivy-action)
- [Cosign Keyless Signing](https://docs.sigstore.dev/signing/quickstart/)
- [Container Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
