# DailyProof

DailyProof is a mobile proof-of-progress app for turning daily goals into visible check-ins. Users create goals, capture proof photos, verify them with AI, and share progress with friends.

## Core Features

- Firebase Auth login and signup
- Firestore user profiles
- Goal creation and progress tracking
- Real camera check-ins with Expo Camera
- Firebase Storage photo uploads
- OpenAI Vision proof verification
- Friends, friend requests, and social feed
- Reactions and comments
- Local goal reminder notifications
- History & Stats with goal analytics

## Tech Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Firebase Auth
- Cloud Firestore
- Firebase Storage
- OpenAI Vision
- Expo Camera
- Expo Notifications

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell, you can copy it with:

```powershell
Copy-Item .env.example .env.local
```

Fill in `.env.local` with your Firebase and OpenAI values.

## Environment Variables

See [.env.example](.env.example) for placeholders.

Required values:

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

Security note: `EXPO_PUBLIC_*` values are visible in client builds. The OpenAI key is currently client-side for the v1 demo. Before production, move OpenAI verification behind Firebase Functions or another backend.

## Run The App

Start Expo:

```bash
npx expo start
```

Then open the app with Expo Go or a development build.

Note: Expo Go may show warnings for `expo-notifications` on Android because remote push notifications are limited in Expo Go. DailyProof v1 uses local reminder notifications only.

## Demo Flow

1. Sign up with a display name, email, and password.
2. Create a goal from Profile -> My Goals.
3. Go to the Camera tab and select an active goal.
4. Take a proof photo.
5. Submit the photo for AI verification.
6. View the verified check-in in the Feed.
7. Add a friend from Profile -> Friends.
8. Accept a friend request from another account.
9. React or comment on visible feed posts.
10. View past check-ins and goal stats in Profile -> History & Stats.

## Current Limitations

- OpenAI verification runs from the client for demo purposes.
- Friend search currently depends on readable user profile data. For production, move search to a backend or a limited public profile collection.
- Local reminder notifications are device-local only. Server push notifications are not implemented yet.
- Photo uploads use Firebase Storage, but production access rules may need denormalized visibility data for friend-readable photos.
- The app is optimized for MVP/demo workflows, not production scale.

## Future Features

- Move OpenAI verification to Firebase Functions or a backend service.
- Add Firebase App Check.
- Add push notifications.
- Add profile photos.
- Add editable goals.
- Add richer goal analytics.
- Add friend discovery through a secure public profile index.
- Add production-grade moderation and abuse prevention.

## Security

See [SECURITY_NOTES.md](SECURITY_NOTES.md) for suggested Firestore rules, Firebase Storage rules, and production security notes.

