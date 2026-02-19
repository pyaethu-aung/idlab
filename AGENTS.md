# UUID Generator - AI Agent Guidelines

This document provides guidelines for AI coding assistants (Antigravity, Gemini CLI, GitHub Copilot, etc.) working on this project.

## Constitution Reference

Refer to `.specify/memory/constitution.md` (v2.2.0) for the authoritative governance document. This file summarizes key rules for quick reference during development.

## Core Principles Summary

| # | Principle | Key Rule |
|---|-----------|----------|
| I | Code Quality & Craftsmanship | No dead code, lint-clean, readable, modular |
| II | Testing & Execution Discipline | 85% coverage, every utility has tests, TDD encouraged |
| III | User Experience Consistency | Consistent interfaces, docs match implementation |
| IV | Performance Requirements | <200ms response, O(n) preferred, bounded resources |
| V | Architecture & Structure | `src/components`, `src/hooks`, `src/utils`, `src/data`, `src/types` |
| VI | Execution Discipline | Run `npm run test`, `npm run lint`, `npm run build` after every task |
| VII | Cross-Platform & Browser Compatibility | Chrome, Safari, Firefox, Edge; desktop & mobile |
| VIII | Theme Support Planning | CSS custom properties, prefers-color-scheme, localStorage persistence |
| IX | Skill-Driven Development | Use skills as primary source truth |

## Required Skills

The Agent MUST consult these skills during planning and implementation.
> **Note**: These paths point to `.agent/skills`, which are project-specific symlinks to the master skills in `.agents/skills`. Always use the `.agent/skills` path.

- **Design System Synthesis**: `.agent/skills/design-md/SKILL.md`
- **Enhance Prompt**: `.agent/skills/enhance-prompt/SKILL.md`
- **React Components**: `.agent/skills/react-components/SKILL.md`
- **Web Design Guidelines**: `.agent/skills/web-design-guidelines/SKILL.md`
- **React & Vite Essentials**: `.agent/skills/react-vite-essentials/SKILL.md`
- **Docker CI/CD Integration**: `.agent/skills/docker-cicd-integration/SKILL.md`
- **Docker Multi-Stage Optimization**: `.agent/skills/docker-multi-stage-optimization/SKILL.md`
- **Docker Security Hardening**: `.agent/skills/docker-security-hardening/SKILL.md`

## Validation Checklist

Before marking any task complete, verify:

```bash
npm run test    # All tests pass, coverage ≥85%
npm run lint    # No linting errors
npm run build   # Build succeeds
```

## Commit Discipline

- **Subject line**: ≤50 characters, imperative mood, no period
- **Body lines**: ≤72 characters
- **Prefix**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Rule**: One commit per completed task/phase

## Project Structure

```text
src/
├── components/   # UI components
├── hooks/        # Stateful React hooks
├── utils/        # Pure utility functions (each needs unit test)
├── data/         # Data shapers and models
└── types/        # Shared TypeScript types
```

## Test Requirements

- Every file in `src/utils/` MUST have a corresponding `.test.ts` file
- Use Vitest as the test harness
- Tests must be deterministic, fast, and independent
- Regression tests are required for all bug fixes

## Theme Support

- Never hard-code colors or theme-specific values
- Use CSS custom properties for all color styling
- Default to system preference via `prefers-color-scheme`
- Persist user choice in `localStorage`

## TypeScript Learning Mode

When implementing code, provide brief comments (1-sentence) explaining *why* a certain TypeScript pattern was used if it relates to a guideline in the skills. Example patterns to explain:
- Discriminated Unions vs. Interfaces
- Generic constraints
- Utility types usage

## Active Features Context

### 002-auto-vuln-updates

**Automated Dependency Vulnerability Updates**

- **Configuration**: Managed via `.github/dependabot.yml` (npm ecosystem, daily schedule).
- **Auto-Merge Policy**: **STRICTLY FORBIDDEN** (FR-009). All security PRs must be manually reviewed.
- **Notifications**: Rely on GitHub native notifications.
- **Key Files**: `.github/dependabot.yml`.

### 003-docker-containerization

**Docker Integration**

- **Build**: Multi-stage `Dockerfile` (Node 20 -> Nginx Alpine).
- **Security**: Non-root user, read-only FS, Trivy scanning (blocking fixable HIGH/CRITICAL).
- **Target**: Linux/AMD64 only (<5min build time).
- **Registry**: GHCR.

### 004-simplify-visual-design

**Simplify Visual Design**

- **Scope**: Remove decorative backgrounds (gradients, grid, blobs), scroll-based browser theme sync, and glassmorphism. Replace CTA gradient with solid accent.
- **Approach**: Subtractive — delete unused hooks, components, CSS, utilities (~200 LOC removed).
- **Key Files Modified**: `src/index.css`, `src/App.css`, `src/App.jsx`, `src/hooks/useBrowserThemeSync.js`.
- **Key Files Deleted**: `useScrollOpacity.js/.test.js`, `ScrollProgressBackground.jsx`, `colors.js`.

---

**Synced with Constitution**: v2.2.0 | **Last Updated**: 2026-02-19
