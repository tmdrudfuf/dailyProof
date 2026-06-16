# DailyProof Security Notes

This document is for the DailyProof v1 Firebase demo setup.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the real values locally.

Required client configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
EXPO_PUBLIC_OPENAI_VISION_MODEL=gpt-5.5
```

`.env`, `.env.*`, and `.env*.local` are ignored by git. Do not commit real keys.

Important: `EXPO_PUBLIC_*` values are bundled into the client app. Firebase web config is expected to be public, but the OpenAI API key is a real secret. It is acceptable only for local demos. Before production, move OpenAI calls behind Firebase Functions or another backend and store the OpenAI key only in server-side environment variables.

## Firestore Rules

Paste these in Firebase Console -> Firestore Database -> Rules.

These rules prioritize security. They keep `/users/{uid}` private to the owner. The current client-side friend search reads from `users`, so production should move search to a backend function or create a separate public profile/search collection with limited fields.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function hasAcceptedFriendship(otherUserId) {
      return isSignedIn() && (
        (
          exists(/databases/$(database)/documents/friendships/$(request.auth.uid + "_" + otherUserId)) &&
          get(/databases/$(database)/documents/friendships/$(request.auth.uid + "_" + otherUserId)).data.status == "accepted"
        ) ||
        (
          exists(/databases/$(database)/documents/friendships/$(otherUserId + "_" + request.auth.uid)) &&
          get(/databases/$(database)/documents/friendships/$(otherUserId + "_" + request.auth.uid)).data.status == "accepted"
        )
      );
    }

    function canReadGoal(goalData) {
      return isOwner(goalData.userId)
        || goalData.visibility == "Public"
        || (
          goalData.visibility == "Friends" &&
          hasAcceptedFriendship(goalData.userId)
        );
    }

    function canReadCheckIn(checkInData) {
      return isSignedIn()
        && exists(/databases/$(database)/documents/goals/$(checkInData.goalId))
        && canReadGoal(
          get(/databases/$(database)/documents/goals/$(checkInData.goalId)).data
        );
    }

    match /users/{userId} {
      allow create: if isOwner(userId)
        && request.resource.data.uid == userId;

      allow read: if isOwner(userId);

      allow update: if isOwner(userId)
        && resource.data.uid == userId
        && request.resource.data.uid == userId;

      allow delete: if false;
    }

    match /goals/{goalId} {
      allow create: if isSignedIn()
        && request.resource.data.id == goalId
        && request.resource.data.userId == request.auth.uid;

      allow read: if isSignedIn()
        && canReadGoal(resource.data);

      allow update: if isSignedIn()
        && resource.data.id == goalId
        && resource.data.userId == request.auth.uid
        && request.resource.data.id == goalId
        && request.resource.data.userId == request.auth.uid;

      allow delete: if isSignedIn()
        && resource.data.userId == request.auth.uid;
    }

    match /checkIns/{checkInId} {
      allow create: if isSignedIn()
        && request.resource.data.id == checkInId
        && request.resource.data.userId == request.auth.uid
        && exists(/databases/$(database)/documents/goals/$(request.resource.data.goalId))
        && get(/databases/$(database)/documents/goals/$(request.resource.data.goalId)).data.userId == request.auth.uid;

      allow read: if canReadCheckIn(resource.data);

      allow update, delete: if false;
    }

    match /friendships/{friendshipId} {
      allow read: if isSignedIn()
        && (
          resource.data.requesterId == request.auth.uid ||
          resource.data.receiverId == request.auth.uid
        );

      allow create: if isSignedIn()
        && request.resource.data.id == friendshipId
        && request.resource.data.requesterId == request.auth.uid
        && request.resource.data.receiverId != request.auth.uid
        && request.resource.data.status == "pending"
        && (
          friendshipId == request.resource.data.requesterId + "_" + request.resource.data.receiverId ||
          friendshipId == request.resource.data.receiverId + "_" + request.resource.data.requesterId
        );

      allow update: if isSignedIn()
        && resource.data.receiverId == request.auth.uid
        && resource.data.status == "pending"
        && request.resource.data.status == "accepted"
        && request.resource.data.id == resource.data.id
        && request.resource.data.requesterId == resource.data.requesterId
        && request.resource.data.receiverId == resource.data.receiverId
        && request.resource.data.createdAt == resource.data.createdAt;

      allow delete: if isSignedIn()
        && (
          (
            resource.data.status == "pending" &&
            resource.data.receiverId == request.auth.uid
          ) ||
          (
            resource.data.status == "accepted" &&
            (
              resource.data.requesterId == request.auth.uid ||
              resource.data.receiverId == request.auth.uid
            )
          )
        );
    }

    match /reactions/{reactionId} {
      allow read: if isSignedIn()
        && exists(/databases/$(database)/documents/checkIns/$(resource.data.postId))
        && canReadCheckIn(
          get(/databases/$(database)/documents/checkIns/$(resource.data.postId)).data
        );

      allow create: if isSignedIn()
        && request.resource.data.id == reactionId
        && request.resource.data.userId == request.auth.uid
        && exists(/databases/$(database)/documents/checkIns/$(request.resource.data.postId))
        && canReadCheckIn(
          get(/databases/$(database)/documents/checkIns/$(request.resource.data.postId)).data
        );

      allow update: if false;

      allow delete: if isSignedIn()
        && resource.data.userId == request.auth.uid;
    }

    // DailyProof also has comments. Keep this if comments are enabled.
    match /comments/{commentId} {
      allow read: if isSignedIn()
        && exists(/databases/$(database)/documents/checkIns/$(resource.data.postId))
        && canReadCheckIn(
          get(/databases/$(database)/documents/checkIns/$(resource.data.postId)).data
        );

      allow create: if isSignedIn()
        && request.resource.data.userId == request.auth.uid
        && exists(/databases/$(database)/documents/checkIns/$(request.resource.data.postId))
        && canReadCheckIn(
          get(/databases/$(database)/documents/checkIns/$(request.resource.data.postId)).data
        );

      allow update, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firebase Storage Rules

Paste these in Firebase Console -> Storage -> Rules.

These rules protect captured check-in photos at:

```text
checkIns/{userId}/{checkInId}.jpg
```

Note: Cloud Storage rules can check Firestore documents with `firestore.get()` and `firestore.exists()`, but Firebase limits how many Firestore documents can be read during one Storage rules evaluation. If Firebase rejects a friend-photo rule because of lookup limits, use one of these production-safe options:

- Add a denormalized `visibleToUserIds` field to each `checkIns/{checkInId}` document and check that single document from Storage rules.
- Serve friend-visible photos through a Firebase Function/backend after verifying Auth and friendship.
- Store photos under a path that matches a purpose-built access document.

```js
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function hasAcceptedFriendship(otherUserId) {
      return isSignedIn() && (
        (
          firestore.exists(/databases/(default)/documents/friendships/$(request.auth.uid + "_" + otherUserId)) &&
          firestore.get(/databases/(default)/documents/friendships/$(request.auth.uid + "_" + otherUserId)).data.status == "accepted"
        ) ||
        (
          firestore.exists(/databases/(default)/documents/friendships/$(otherUserId + "_" + request.auth.uid)) &&
          firestore.get(/databases/(default)/documents/friendships/$(otherUserId + "_" + request.auth.uid)).data.status == "accepted"
        )
      );
    }

    function goalIsVisibleToRequester(goalId, ownerId) {
      return firestore.exists(/databases/(default)/documents/goals/$(goalId)) && (
        firestore.get(/databases/(default)/documents/goals/$(goalId)).data.userId == request.auth.uid ||
        firestore.get(/databases/(default)/documents/goals/$(goalId)).data.visibility == "Public" ||
        (
          firestore.get(/databases/(default)/documents/goals/$(goalId)).data.userId == ownerId &&
          firestore.get(/databases/(default)/documents/goals/$(goalId)).data.visibility == "Friends" &&
          hasAcceptedFriendship(ownerId)
        )
      );
    }

    function canReadCheckInPhoto(userId, checkInId) {
      return isSignedIn()
        && firestore.exists(/databases/(default)/documents/checkIns/$(checkInId))
        && firestore.get(/databases/(default)/documents/checkIns/$(checkInId)).data.userId == userId
        && goalIsVisibleToRequester(
          firestore.get(/databases/(default)/documents/checkIns/$(checkInId)).data.goalId,
          userId
        );
    }

    match /checkIns/{userId}/{checkInId}.jpg {
      allow create: if isOwner(userId)
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');

      allow read: if isOwner(userId)
        || canReadCheckInPhoto(userId, checkInId);

      allow update: if false;

      allow delete: if isOwner(userId);
    }

    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Production Warning

Do not ship a production mobile app that calls OpenAI directly with `EXPO_PUBLIC_OPENAI_API_KEY`.

Recommended production flow:

```text
DailyProof app -> Firebase Auth token -> Firebase Functions/backend -> OpenAI
```

The backend should:

- Verify the Firebase Auth token.
- Rate limit verification requests.
- Validate that the user owns the goal/check-in.
- Keep `OPENAI_API_KEY` as a server-only environment variable.
- Return only the verification result to the app.
