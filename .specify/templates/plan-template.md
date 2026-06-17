# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: TypeScript with Expo React Native / [NEEDS CLARIFICATION if changed]

**Primary Dependencies**: Expo, React Native, React Navigation, Firebase / [feature additions]

**Storage**: Firebase Auth, Cloud Firestore, Firebase Storage, device-local state where applicable

**Testing**: TypeScript check plus focused manual Expo/mobile QA / [feature-specific tests]

**Target Platform**: Expo mobile app for iOS/Android, with web only when explicitly in scope

**Project Type**: Mobile app

**Performance Goals**: Responsive phone UX, fast screen transitions, no avoidable camera/feed jank

**Constraints**: Preserve existing structure, small safe changes, camera-only proof policy, Firebase rules/security awareness, Expo versioned docs before coding Expo API changes

**Scale/Scope**: [feature scope, touched screens/services, expected data volume or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Existing Structure: Does the plan keep the current `src/` organization and avoid rewriting working screens without documented need?
- Spec-Led Delivery: Are current files inspected and are spec, plan, and tasks present before app code changes?
- Small Safe Changes: Is the implementation split into readable increments with changed files and test steps after each step?
- Expo/Firebase Mobile Fit: If Expo APIs change, has the versioned Expo documentation required by `AGENTS.md` been checked? Are Firebase/Auth/Firestore/Storage/security effects documented?
- Product Integrity: Does the feature preserve camera-only daily proof, future AI validation boundaries, and friend-feed visibility expectations unless the spec explicitly changes them?

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
`-- tasks.md
```

### Source Code (repository root)

```text
App.tsx
src/
|-- components/
|-- context/
|-- navigation/
|-- screens/
|-- services/
|-- theme/
`-- types/

assets/
scripts/
```

**Structure Decision**: [Document touched existing directories and justify any new directories]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., new top-level API service] | [current need] | [why existing Expo/Firebase structure is insufficient] |
