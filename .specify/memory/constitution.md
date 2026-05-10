<!--
SYNC IMPACT REPORT
Version: 2.3.0 -> 2.3.1
Modified Principles:
- None
Added Sections:
- Governance: CLAUDE.md Sync (MANDATORY) added; replaces the former
  AGENTS.md Sync mandate. CLAUDE.md is the single source of AI-assistant
  instructions in this repo.
Removed Sections:
- None
Templates Updated:
- .specify/templates/plan-template.md ✅ no references requiring change
- .specify/templates/spec-template.md ✅ no references requiring change
- .specify/templates/tasks-template.md ✅ no references requiring change
- AGENTS.md ✅ updated in previous amendment
Deferred Items:
- None
-->
# UUID Generator Constitution

## Core Principles

### I. Code Quality & Craftsmanship
Code must be readable, maintainable, and idiomatic. Automated linting and
formatting are required on every commit. No dead code, unused assets, or
commented-out blocks are permitted; remove unreferenced resources as part of
each change. Refactoring is continuous, and complexity is managed through
modular design.

### II. Testing & Execution Discipline (NON-NEGOTIABLE)
Testing is mandatory (Unit & Integration). Run `npm run test`, `npm run lint`,
and `npm run build` locally after every task and before opening a PR. Every
code change MUST add or update relevant unit tests, and all tests MUST pass
locally and in CI before merge. **Every utility function in `src/utils/` MUST
have a corresponding unit test file** (Vitest). Regression tests are required
for bug fixes. Maintain coverage at or above 85%. Tests must be deterministic,
fast, and independent. TDD is encouraged.

### III. User Experience Consistency
Interfaces (CLI, API, UI) must be predictable and consistent. Standardize
flags, error messages, and return codes across the application. Documentation
must match implementation. Prioritize user intent and minimize cognitive load
in workflows.

### IV. Performance Requirements
Performance is a feature. Define and respect latency/throughput budgets
(e.g., <200ms response time for user info). O(n) complexity or better is
preferred for core algorithms. Resource usage (CPU/RAM) must be bounded and
monitored.

### V. Architecture & Structure
Follow the agreed project layout: UI in `src/components`, stateful hooks in
`src/hooks`, pure utilities in `src/utils`, and data shapers/models in
`src/data` (plus shared types in `src/types`). Keep configuration minimal and
co-located. Avoid ad-hoc folders and remove unused files as the structure
evolves.

### VI. Execution Discipline (NON-NEGOTIABLE)
After completing each task, the project MUST be validated with a successful
`npm run build` (or equivalent platform build) in addition to `npm run test`
and `npm run lint`. If the build cannot run (e.g., platform limitations),
document the blocker and perform a local smoke run to verify runtime basics.
Never mark a task complete without a passing build or documented exception.

### VII. Cross-Platform & Browser Compatibility
The user interface MUST be fully functional and aesthetically consistent across
desktop and mobile browsers, including all major browsers (Chrome, Safari,
Firefox, Edge). Responsive design is mandatory, and testing must be performed
on both screen types before marking UI tasks as complete.

### VIII. Theme Support Planning
All UI features MUST be planned and implemented with dark/light theme support
from the start. Never hard-code colors or theme-specific values that would
create technical debt when adding theme switching. The default theme MUST match
the user's system preference (using `prefers-color-scheme` media query). User
theme choice MUST be persisted in browser storage (localStorage) and take
precedence over system preference for returning users. Design tokens and CSS
custom properties are required for all color and theme-related styling.

**Rationale**: Retrofitting theme support is expensive and error-prone.
Planning for themes from the beginning ensures maintainable, accessible UI with
minimal technical debt. Respecting system preferences improves user experience,
while persisting explicit user choices ensures preference continuity.

### IX. Skill-Driven Development & Agentic Workflow (NON-NEGOTIABLE)
The Agent MUST treat any skills present under `.agents/skills/` (invocable via
`/<skill-name>`) as "Primary Source Truth" during all phases of the spec-kit
workflow (`/specify`, `/plan`, `/implement`). Where such a skill governs a
domain touched by the current task — commit discipline, PR creation, README
upkeep, or any future addition — the Agent MUST consult it before generating
code or artifacts, and SHOULD cite the skill it followed when its guidance
shaped a non-obvious decision.

**Rationale**: Wiring this principle to the directory rather than to a
hard-coded list of skill names means project guidance evolves with the toolkit,
not with the constitution. Skills can be added or retired without amending
governance, and the Agent is never asked to consult a skill that doesn't exist.

## Documentation & Standards

All public APIs and libraries must be documented. The README must be kept up to
date with the latest features and usage instructions. Internal documentation
should use Markdown and be co-located with the code. Architecture and structure
decisions must be reflected in docs and code owners should prune obsolete
references.

## Review & Quality Gates

All code changes require a Pull Request review. Continuous Integration (CI)
checks (linting, testing, build) must pass before merging; tests must be
added/updated for the change set. No direct pushes to the main branch are
permitted. Reviews must confirm adherence to structure conventions, removal of
unused code/resources, compliance with these principles, documented local runs
of `npm run test`, `npm run lint`, and `npm run build`, and coverage remaining
above 85%.

## Governance

This Constitution supersedes previous ad-hoc practices. Amendments require a
Pull Request with justification and team approval.

**CLAUDE.md Sync (MANDATORY)**: Whenever this Constitution is amended,
`CLAUDE.md` MUST be updated to reflect the changes. This ensures AI coding
assistants always operate with current project guidelines.

**Commit Discipline (MANDATORY)**: Each phase in `tasks.md` MUST be committed
individually after completion. Commit messages MUST follow the 50/72 rule:
subject line ≤50 characters (imperative mood, no period), followed by a blank
line, then optional body text with lines ≤72 characters. Subject lines should
start with a conventional commit type prefix (e.g., `feat:`, `fix:`, `docs:`,
`refactor:`, `test:`). Every commit must represent a complete, testable unit of
work.

Versioning follows Semantic Versioning (MAJOR for principle changes, MINOR for
additions, PATCH for clarifications). Compliance is verified during Code Review
and CI.

**Version**: 2.3.1 | **Ratified**: 2026-01-19 | **Last Amended**: 2026-05-11
