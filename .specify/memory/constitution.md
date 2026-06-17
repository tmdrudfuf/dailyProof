<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template principle 1 -> I. Preserve Existing Structure
- Template principle 2 -> II. Spec-Led Feature Delivery
- Template principle 3 -> III. Small, Safe Implementation
- Template principle 4 -> IV. Mobile-First Expo/Firebase Architecture
- Template principle 5 -> V. Daily Proof Product Integrity
Added sections:
- Product And Technical Boundaries
- Development Workflow
Removed sections:
- Template placeholder sections
Templates requiring updates:
- updated .specify/templates/plan-template.md
- updated .specify/templates/spec-template.md
- updated .specify/templates/tasks-template.md
- not present .specify/templates/commands/
Follow-up TODOs: None
-->
# Daily Proof Constitution

## Core Principles

### I. Preserve Existing Structure
The project MUST keep the current Expo app structure unless a feature cannot be
implemented cleanly within it. New files MUST follow the existing `src/`
organization for screens, components, context, navigation, services, theme, and
types. Working screens MUST NOT be rewritten or reorganized without a documented
need in the feature plan.

Rationale: Daily Proof already has a working mobile app shape. Stable structure
reduces regression risk and keeps feature work easy to review.

### II. Spec-Led Feature Delivery
Every feature MUST be specified, planned, task-broken, and then implemented in
that order. Each feature MUST have a spec, plan, and tasks before app code is
changed. Plans MUST inspect the current files first and record the existing
screens, services, and data paths that the feature touches.

Rationale: The app changes frequently across product, Firebase, Expo, and AI
flows. Spec-first work keeps scope explicit before implementation starts.

### III. Small, Safe Implementation
Changes MUST be small, readable, and limited to the files required for the
feature. Code MUST prefer direct, understandable control flow over clever
abstractions. After each implementation step, the changed files and test path
MUST be explained so the result can be validated before the next step.

Rationale: Mobile app regressions are expensive to diagnose. Small changes with
clear verification make issues easier to isolate.

### IV. Mobile-First Expo/Firebase Architecture
Daily Proof MUST remain a React Native Expo app using TypeScript, Firebase, and
mobile-first UX. Feature plans that touch Expo APIs MUST use the versioned Expo
documentation required by `AGENTS.md` before coding. Firebase Auth, Firestore,
Firebase Storage, camera permissions, notifications, and navigation changes MUST
respect existing service boundaries and user-facing mobile constraints.

Rationale: Expo and Firebase APIs are version-sensitive, and the product is used
primarily through mobile camera workflows.

### V. Daily Proof Product Integrity
Core product work MUST protect the Daily Proof loop: users set daily goals,
capture camera-only proof photos, submit proof for validation, and share
appropriate progress in the friend feed. Proof capture MUST prioritize real
camera input over gallery uploads unless the feature spec explicitly changes the
product policy. AI validation is expected to evolve later, so validation flows
MUST be isolated enough to replace or move behind a backend.

Rationale: The app's value depends on credible daily proof, future AI
validation, and trusted social visibility.

## Product And Technical Boundaries

- The app name is Daily Proof, implemented as an Expo React Native mobile app.
- The default structure is the existing repository layout; new top-level
  systems require plan justification.
- Firebase remains the system of record for authentication, profiles, goals,
  check-ins, photos, friends, feed, reactions, and comments unless a plan
  explicitly replaces a boundary.
- Camera-only proof is the default product policy for check-ins.
- Client-visible secrets are acceptable only for local demo flows; production
  plans involving AI validation MUST consider a backend boundary.
- UX decisions MUST favor phone-sized screens, touch targets, permission states,
  offline/error states, and readable feedback over desktop-first layouts.

## Development Workflow

1. Inspect the current files before proposing or coding changes.
2. Create or update the feature spec with user stories, acceptance scenarios,
   edge cases, and measurable success criteria.
3. Create the implementation plan with technical context, touched files, Expo
   documentation notes when applicable, Firebase/security implications, and the
   Constitution Check result.
4. Create tasks grouped by independently testable user story and ordered so each
   step can be verified.
5. Implement tasks in small increments. After each implementation step, record
   changed files and how to test the result.
6. Verify with the narrowest useful command or manual mobile flow. Broaden
   verification when shared services, navigation, Firebase writes, camera,
   notifications, or feed behavior change.

## Governance

This constitution supersedes conflicting project practices for Daily Proof
feature work. Amendments MUST update this file and any affected Spec Kit
templates in the same change. Amendment rationale MUST be included in the Sync
Impact Report.

Versioning follows semantic versioning:
- MAJOR for removing or redefining principles in a backward-incompatible way.
- MINOR for adding principles, sections, or materially expanding governance.
- PATCH for clarifications, wording fixes, and non-semantic refinements.

Compliance review is required during planning and after design. Any plan that
violates a principle MUST document the violation, the reason it is necessary,
and the simpler alternative that was rejected.

**Version**: 1.0.0 | **Ratified**: 2026-06-17 | **Last Amended**: 2026-06-17
