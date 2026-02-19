---
name: docker-security-hardening
description: Analyze and harden Docker configurations for security best practices. Use when asked to "secure my Docker setup", "scan for vulnerabilities", "check Docker security", or "harden container security".
metadata:
  author: custom
  version: "2.0.0"
  argument-hint: <dockerfile-path>
---

# Docker Security Hardening Skill

Security analysis and hardening guide tailored to this project: a **React + Vite SPA** served by **Nginx** in a multi-stage Docker build with Cosign signing and Trivy scanning.

## Project Context

| Aspect | Detail |
|--------|--------|
| **App type** | React + Vite SPA (static files only) |
| **Dockerfile** | 2-stage: `node:20-alpine` → `nginx:alpine` |
| **Non-root user** | `app` (UID 1000, no home dir, no shell) |
| **Runtime port** | 80 (Nginx) |
| **Runtime security** | `--read-only`, `--cap-drop ALL`, tmpfs mounts |
| **Image signing** | Cosign keyless via Sigstore/Fulcio |
| **Vulnerability scanning** | Trivy (Docker image), Hadolint (Dockerfile), Snyk (npm) |
| **Ignored CVEs** | `.trivyignore` for unfixable vulnerabilities |

## What This Skill Does

1. **Dockerfile Security Analysis**
   - Scans for security anti-patterns
   - Validates multi-stage build (no build tools in runtime)
   - Verifies non-root user configuration
   - Checks Nginx security headers

2. **Image Vulnerability Scanning**
   - Trivy scan integrated in CI (blocks CRITICAL/HIGH)
   - `.trivyignore` for known unfixable CVEs
   - npm audit + Snyk for dependency scanning

3. **Runtime Security**
   - Read-only root filesystem
   - All capabilities dropped (`--cap-drop ALL`)
   - tmpfs mounts for writable directories
   - No shell access for the app user

## Security Audit: Current Project Status

### ✅ What's Already Secured

| Security Control | Status | Implementation |
|-----------------|--------|----------------|
| Multi-stage build | ✅ | Builder → Runtime, no build tools in final image |
| Non-root user | ✅ | `app` (UID 1000, no home, `/bin/false` shell) |
| Minimal base image | ✅ | `nginx:alpine` |
| Read-only filesystem | ✅ | `--read-only` flag in `docker:run` script |
| Capabilities dropped | ✅ | `--cap-drop ALL` in `docker:run` script |
| Security headers | ✅ | X-Frame-Options, CSP, X-Content-Type-Options, Referrer-Policy |
| Dockerfile linting | ✅ | Hadolint in CI pipeline |
| Image scanning | ✅ | Trivy with `exit-code: 1` on CRITICAL/HIGH |
| Image signing | ✅ | Cosign keyless signing on tag push |
| Dependency scanning | ✅ | npm audit + Snyk in separate workflow |
| `.dockerignore` | ✅ | Excludes secrets, source control, dev files |

### ⚠️ Areas to Review

| Area | Note |
|------|------|
| No `HEALTHCHECK` in Dockerfile | Health is at Nginx `/health` endpoint, but Docker won't track it natively |
| `curl` installed in runtime | Adds attack surface (~5MB); needed for health checks |
| No `--security-opt=no-new-privileges` | Could add to `docker:run` command |
| CSP allows `unsafe-inline` / `unsafe-eval` | Needed for React, but worth tightening if possible |

## Security Checklist (Project-Specific)

### Dockerfile Security
- [x] Using official minimal base images (`node:20-alpine`, `nginx:alpine`)
- [x] Base image versions pinned (e.g., `node:20-alpine`, not `node:latest`)
- [x] Multi-stage build — no build tools in final image
- [x] Non-root user with no shell (`/bin/false`) and no home directory
- [x] `WORKDIR` properly set in builder stage
- [x] Commands combined in single `RUN` layer (runtime stage)
- [x] Exec form used for `CMD` (`["nginx", "-g", "daemon off;"]`)
- [ ] `HEALTHCHECK` directive in Dockerfile (optional — handled by Nginx `/health`)

### .dockerignore
- [x] Excludes `node_modules`, `.git`, `dist`
- [x] Excludes documentation and config files
- [x] Excludes `coverage`, `.vscode`, `.idea`
- [x] Does NOT exclude `.docker/` (needed for `COPY .docker/nginx.conf`)

### Runtime Security
- [x] Read-only root filesystem (`--read-only`)
- [x] All capabilities dropped (`--cap-drop ALL`)
- [x] tmpfs for writable directories (`/var/cache/nginx`, `/var/run`, `/tmp`)
- [x] Only port 80 exposed
- [ ] `--security-opt=no-new-privileges` (recommended addition)
- [ ] Memory/CPU limits (recommended for production)

### Nginx Security Headers
- [x] `X-Frame-Options: DENY` — Prevents clickjacking
- [x] `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- [x] `Referrer-Policy: strict-origin-when-cross-origin` — Controls referrer info
- [x] `Content-Security-Policy` — Restricts resource loading
- [ ] `Strict-Transport-Security` (HSTS) — Add if serving over HTTPS
- [ ] `Permissions-Policy` — Restrict browser features

### CI/CD Security
- [x] Trivy image scan blocks on CRITICAL/HIGH
- [x] `.trivyignore` for unfixable CVEs
- [x] Hadolint Dockerfile linting
- [x] Cosign keyless image signing
- [x] npm audit + Snyk dependency scanning
- [x] Minimal GH Actions permissions (`contents: read`, `packages: write`)

### Secrets Management
- [x] No hardcoded credentials in Dockerfile
- [x] `GITHUB_TOKEN` used for registry auth (auto-provided)
- [x] `SNYK_TOKEN` stored as GitHub secret
- [x] Cosign uses keyless signing (no private key to manage)

## Recommended Tools

### 1. Trivy (Vulnerability Scanner)

```bash
# Install Trivy
brew install aquasecurity/trivy/trivy

# Scan the Docker image
trivy image uuid-generator:local

# Scan Dockerfile config
trivy config Dockerfile

# Scan with .trivyignore
trivy image --ignorefile .trivyignore uuid-generator:local

# Generate SBOM
trivy image --format cyclonedx uuid-generator:local
```

### 2. Hadolint (Dockerfile Linter)

```bash
# Install Hadolint
brew install hadolint

# Lint Dockerfile
hadolint Dockerfile

# Example output for this project:
# Dockerfile:19 DL3018 Pin versions in apk add (suppressed with inline ignore)
```

### 3. Cosign (Image Verification)

```bash
# Verify a signed image
cosign verify ghcr.io/pyaethu-aung/uuid-generator:1.0.0 \
  --certificate-identity-regexp="https://github.com/pyaethu-aung/uuid-generator" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```

### 4. Docker Scout (Optional)

```bash
# Analyze image for vulnerabilities and recommendations
docker scout cves uuid-generator:local
docker scout recommendations uuid-generator:local
```

## Secure Docker Run Command

The project's `package.json` includes a hardened run command:

```bash
docker run --rm -p 8080:80 --name uuid-app \
  --read-only \
  --cap-drop ALL \
  --tmpfs /var/cache/nginx:mode=1777 \
  --tmpfs /var/run:mode=1777 \
  --tmpfs /tmp:mode=1777 \
  uuid-generator:local
```

### Enhanced Version (Recommended)

```bash
docker run --rm -p 8080:80 --name uuid-app \
  --read-only \
  --cap-drop ALL \
  --security-opt=no-new-privileges \
  --memory=128m \
  --cpus=0.5 \
  --tmpfs /var/cache/nginx:mode=1777,size=10m \
  --tmpfs /var/run:mode=1777,size=1m \
  --tmpfs /tmp:mode=1777,size=10m \
  uuid-generator:local
```

Additions explained:
- `--security-opt=no-new-privileges` — Prevents privilege escalation
- `--memory=128m` — Limits memory usage
- `--cpus=0.5` — Limits CPU usage
- `size=` on tmpfs — Limits writable space

## Nginx Security Headers Deep Dive

Current configuration in `.docker/nginx.conf`:

```nginx
# Prevents the page from being embedded in iframes (anti-clickjacking)
add_header X-Frame-Options "DENY" always;

# Prevents browsers from MIME-sniffing content types
add_header X-Content-Type-Options "nosniff" always;

# Controls how much referrer info is shared
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy — controls resource loading
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';" always;
```

### Recommended Additional Headers

```nginx
# HTTP Strict Transport Security (if behind HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Restrict browser feature access
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;

# Prevent information leakage
server_tokens off;
```

## CI/CD Security Pipeline

The actual security scanning flow in this project:

```
Push/PR → Hadolint → Build Image → Trivy Scan (gate) → Push (tags only) → Cosign Sign
                                        ↓
                                  .trivyignore
                                  (skip known unfixable CVEs)
```

Separate workflow for npm dependencies:
```
Package changes → npm audit → Snyk scan → Upload SARIF to GitHub Security
```

## Output Format

When analyzing this project's Docker security:

### Example Analysis

```
🔒 Docker Security Analysis — uuid-generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PASSED (11/15):
  • Multi-stage build separates build and runtime
  • Non-root user (app, UID 1000, no shell)
  • Alpine base images
  • Read-only root filesystem
  • All capabilities dropped
  • Security headers configured
  • Trivy scanning in CI (CRITICAL/HIGH gate)
  • Hadolint Dockerfile linting
  • Cosign image signing
  • Dependency scanning (npm audit + Snyk)
  • No hardcoded secrets

⚠️ REVIEW (4/15):
  1. [LOW] No HEALTHCHECK in Dockerfile
     Impact: Docker doesn't natively track container health
     Note: /health endpoint exists via Nginx config
     Fix: Optional — add HEALTHCHECK CMD curl -f http://localhost:80/health

  2. [LOW] curl installed in runtime image
     Impact: Increases attack surface by ~5MB
     Fix: Remove if health checks are handled externally

  3. [LOW] No --security-opt=no-new-privileges in docker:run
     Impact: Privilege escalation theoretically possible
     Fix: Add to the docker:run npm script

  4. [INFO] CSP allows 'unsafe-inline' and 'unsafe-eval'
     Impact: XSS mitigation is weakened
     Note: Typically required for React/Vite SPA bundles
```

## References

- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Cosign Keyless Signing](https://docs.sigstore.dev/signing/quickstart/)
- [Mozilla Observatory — Security Headers](https://observatory.mozilla.org/)
