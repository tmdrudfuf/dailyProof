---

description: "Task list template for Daily Proof feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include TypeScript checks and focused Expo/mobile QA for every feature. Add automated tests when requested by the feature specification or when shared services/data behavior change.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Daily Proof mobile app**: `App.tsx`, `src/components/`, `src/context/`, `src/navigation/`, `src/screens/`, `src/services/`, `src/theme/`, `src/types/`
- **Assets and scripts**: `assets/`, `scripts/`
- Avoid new top-level app structures unless plan.md documents why the existing structure cannot support the feature

<!--
  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Contracts or Firebase data effects
  - Daily Proof constitution gates: preserve structure, small safe changes,
    mobile-first UX, Firebase/security effects, camera-only proof policy, and
    changed-files/test-step reporting after implementation increments
-->

## Phase 1: Setup (Shared Context)

**Purpose**: Inspect current implementation and confirm constraints before coding

- [ ] T001 Inspect current screens, services, navigation, context, and types touched by the feature
- [ ] T002 Document existing Firebase Auth/Firestore/Storage reads and writes affected by the feature
- [ ] T003 [P] Check versioned Expo documentation before coding any Expo API changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared decisions and infrastructure that MUST be complete before user story work

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define data shape or service contract changes in the existing `src/` structure
- [ ] T005 Define camera, notification, network, loading, empty, and error states for affected mobile screens
- [ ] T006 Identify security/privacy effects for proof photos, friend visibility, and Firebase rules
- [ ] T007 Confirm manual QA path and verification command for the feature

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1) MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1

- [ ] T008 [P] [US1] Add focused automated test if required by spec or shared service risk
- [ ] T009 [US1] Prepare manual Expo/mobile QA steps for the story

### Implementation for User Story 1

- [ ] T010 [P] [US1] Update types/models in `src/types/` or existing service types
- [ ] T011 [US1] Update service/data logic in `src/services/`
- [ ] T012 [US1] Update affected screen or component in `src/screens/` or `src/components/`
- [ ] T013 [US1] Add permission, loading, empty, and error states as needed
- [ ] T014 [US1] Record changed files and how to test User Story 1

**Checkpoint**: User Story 1 is functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2

- [ ] T015 [P] [US2] Add focused automated test if required by spec or shared service risk
- [ ] T016 [US2] Prepare manual Expo/mobile QA steps for the story

### Implementation for User Story 2

- [ ] T017 [US2] Update existing service, navigation, screen, or component files
- [ ] T018 [US2] Integrate with User Story 1 components if needed while preserving independent testability
- [ ] T019 [US2] Record changed files and how to test User Story 2

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3

- [ ] T020 [P] [US3] Add focused automated test if required by spec or shared service risk
- [ ] T021 [US3] Prepare manual Expo/mobile QA steps for the story

### Implementation for User Story 3

- [ ] T022 [US3] Update existing service, navigation, screen, or component files
- [ ] T023 [US3] Record changed files and how to test User Story 3

**Checkpoint**: All selected user stories work independently

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs or README if behavior changes
- [ ] TXXX Code cleanup limited to files touched for this feature
- [ ] TXXX Security/privacy hardening for Firebase, proof photos, and feed visibility
- [ ] TXXX Run `npx tsc --noEmit` or the narrowest available verification command
- [ ] TXXX Validate affected Expo/mobile flow manually, including permission and error states
- [ ] TXXX Run quickstart.md validation if present

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - may integrate with US1 but remains independently testable
- **User Story 3 (P3)**: Can start after Foundational - may integrate with US1/US2 but remains independently testable

### Within Each User Story

- Tests or manual QA steps before implementation
- Types before services when data shapes change
- Services before screens when business logic changes
- Core implementation before integration
- Changed-files/test-step report before checkpoint completion

### Parallel Opportunities

- Setup research tasks marked [P] can run in parallel
- Tests for a user story marked [P] can run in parallel
- Different files within a story can be worked on in parallel when dependencies allow

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate User Story 1 independently
5. Demo or continue only after verification is clear

### Incremental Delivery

1. Complete Setup and Foundational work
2. Add User Story 1, test independently, then report changed files/test steps
3. Add User Story 2, test independently, then report changed files/test steps
4. Add User Story 3, test independently, then report changed files/test steps
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story must be independently completable and testable
- Avoid vague tasks, unrelated refactors, same-file conflicts, and cross-story dependencies that break independence
