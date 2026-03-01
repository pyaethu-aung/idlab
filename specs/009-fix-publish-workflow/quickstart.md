# Quickstart for Testing Deployment Security Pipeline Fixes

This documentation outlines the steps for a local developer or maintainer to verify the changes introduced in the `009-fix-publish-workflow` feature for testing and reproduction outside of the automated CI/CD environment.

## Goal
The primary objective of this exercise is to ensure that the updated Dockerfile image (`nginx:alpine-slim`), without the internal legacy `apk upgrades`, parses and builds clean of the `libpng` (`CVE-2026-25646`) defect.

---

### Step 1: Run the App Local Build
Execute the application build and run the test suite to ensure the overarching infrastructure functionality is entirely stable.

```bash
npm install
npm run build
npm run test
```

### Step 2: Build the Container Image locally

With the `Dockerfile` updated to point to `nginx:alpine-slim`, trigger a fresh local docker build pointing to the app's directory. 

```bash
docker build -t pyaethu-aung/uuid-generator:test-build .
```

### Step 3: Run Trivy Scan Local (Optional Replication)

To reproduce the GitHub Actions Workflow scan steps manually, use a local instance of Trivy against your test image. Be sure that any `.trivyignore` entries for the vulnerability in question have been expunged from the directory.

```bash
trivy image --exit-code 1 --severity CRITICAL pyaethu-aung/uuid-generator:test-build
```

If successful, Trivy will return with exit code 0 and output that no critical vulnerabilities have been detected. If the Dockerfile hasn't been properly patched, Trivy will fail with a non-zero exit code due to the `libpng` inclusion.
