# Quickstart

This feature updates CI/CD pipelines. No new application code or services need to be started locally.

To test the CI/CD optimizations locally (if you have `act` installed):
```bash
act push -W .github/workflows/lint.yml
act push -W .github/workflows/security.yml
```
