# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Status**: Draft

**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  User stories MUST be prioritized by user value. Each story must be
  independently testable and deliver a usable increment of Daily Proof.
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when [boundary condition]?
- How does the system handle [error scenario]?
- What happens when camera, notification, network, or Firebase permissions fail?
- What visibility applies to private, friends-only, and public proof content?
- How does the feature behave on a small phone screen and after app restart?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]
- **FR-XXX**: Feature MUST preserve the camera-only proof policy unless this spec explicitly changes it.
- **FR-XXX**: Feature MUST define Firebase Auth, Firestore, and Storage effects when data is read or written.
- **FR-XXX**: Feature MUST describe mobile permission, loading, empty, and error states for affected screens.

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Daily Proof Fit *(mandatory)*

- **Existing structure impact**: [Screens, services, navigation, context, or types touched]
- **Proof/photo policy**: [Camera-only preserved, changed, or N/A with rationale]
- **AI validation impact**: [None, client-side demo flow, backend-ready boundary, or NEEDS CLARIFICATION]
- **Friend feed/privacy impact**: [None, private/friends/public visibility behavior, or NEEDS CLARIFICATION]
- **Mobile UX impact**: [Phone-first states, permissions, loading, empty, and error handling]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles expected usage without degradation"]
- **SC-003**: [User success metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Product metric, e.g., "Users can verify a proof check-in from camera capture to feed visibility"]

## Assumptions

- [Assumption about target users, e.g., "Users are signed in with Firebase Auth"]
- [Assumption about scope boundaries, e.g., "Web support is out of scope unless explicitly requested"]
- [Assumption about data/environment, e.g., "Existing Firebase collections will be reused"]
- [Dependency on existing system/service, e.g., "Requires access to existing goal and check-in services"]
