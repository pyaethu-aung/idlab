---
description: "Task list for CI/CD Optimizations"
---

# Tasks: CI/CD Optimizations

**Input**: Design documents from `/specs/007-ci-cd-optimizations/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: This feature strictly modifies CI/CD GitHub Actions configurations. Manual observation of the CI action runs replaces unit testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create `.nvmrc` in repository root configured to Node.js `20`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

*(No foundational blocking tasks required for this YAML-only feature update)*

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure and Reliable CI Execution (Priority: P1) 🎯 MVP

**Goal**: Developers pushing code need CI actions to use stable, pinned versions and handle missing optional secrets with high visibility.

**Independent Test**: Can be fully tested by running the security workflow without a vulnerability scanner token, verifying it skips the step instead of failing, checks that the code analysis scanner runs without deprecation warnings, and verifies pinned action versions are used.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Update CodeQL to `v4` and pin Snyk to `v1.0.0` in `.github/workflows/security.yml`
- [ ] T003 [P] [US1] Pin Trivy action to `0.34.1` in `.github/workflows/docker-publish.yml`
- [ ] T004 [US1] Add `continue-on-error` behavior for Snyk step in `.github/workflows/security.yml` (depends on T002)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Optimized Pipeline Performance (Priority: P1)

**Goal**: Developers pushing code need redundant jobs canceled, caching enabled for validation, and optimized container builds to get faster feedback and reduce compute minutes.

**Independent Test**: Can be fully tested by pushing back-to-back commits to the same branch and verifying older runs cancel, and by running the validation workflow twice to observe cache hits.

### Implementation for User Story 2

- [ ] T005 [P] [US2] Add concurrency cancellation group to `.github/workflows/security.yml`
- [ ] T006 [P] [US2] Add concurrency cancellation group to `.github/workflows/lint.yml`
- [ ] T007 [P] [US2] Add push to `main` branch trigger and `actions/cache` for ESLint to `.github/workflows/lint.yml`
- [ ] T008 [P] [US2] Add inclusion path filters and optimize multi-arch build load in `.github/workflows/docker-publish.yml`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - Reliable Deployments (Priority: P1)

**Goal**: Release managers need deployments to only happen after validation passes, and for jobs to timeout if they hang, preventing bad code deployment and wasted runners.

**Independent Test**: Can be fully tested by making the validation layer fail and verifying deployment does not execute, and by verifying the workflow config sets a hard timeout limit.

### Implementation for User Story 4

- [ ] T009 [P] [US4] Add `timeout-minutes: 15` to all jobs in `.github/workflows/security.yml`
- [ ] T010 [P] [US4] Add `timeout-minutes: 15` to all jobs in `.github/workflows/docker-publish.yml`
- [ ] T011 [P] [US4] Add `timeout-minutes: 15` to all jobs in `.github/workflows/lint.yml`
- [ ] T012 [P] [US4] Add `timeout-minutes: 15` to all jobs in `.github/workflows/deploy.yml`
- [ ] T013 [US4] Ensure lint validation runs before the build in `.github/workflows/deploy.yml`

**Checkpoint**: All user stories up to P1 should now be independently functional

---

## Phase 6: User Story 3 - Centralized Configuration (Priority: P2)

**Goal**: Maintainers need runtime versions centralized in a single `.nvmrc` configuration file so they only have to update it in one place when upgrading environments.

**Independent Test**: Can be fully tested by reviewing workflow logs to ensure all steps utilizing the runtime environment dynamically read the version from the centralized file.

### Implementation for User Story 3

- [ ] T014 [P] [US3] Update `actions/setup-node` to use `node-version-file: '.nvmrc'` in `.github/workflows/security.yml`
- [ ] T015 [P] [US3] Update `actions/setup-node` to use `node-version-file: '.nvmrc'` in `.github/workflows/lint.yml`
- [ ] T016 [P] [US3] Update `actions/setup-node` to use `node-version-file: '.nvmrc'` in `.github/workflows/deploy.yml`

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T017 [P] Verify documentation workflows and ensure testing/linting scripts work securely in `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel if targeting different workflows
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- The Node version setup (`T001`) can be completed first.
- Security updates (`US1`), Concurrency (`US2`), and Timeouts (`US4`) target some overlapping files. To avoid merge conflicts during manual editing, these should ideally be grouped by the specific file being edited, or executed sequentially by a single agent or developer.
- If editing different files, e.g., `security.yml` changes vs `docker-publish.yml` changes, those tasks can be executed in parallel.

---

## Parallel Example: User Story 2

```bash
# Update multiple separate workflows concurrently for concurrency caching:
Task: "Add concurrency cancellation group to .github/workflows/security.yml"
Task: "Add concurrency cancellation group to .github/workflows/lint.yml"
```
