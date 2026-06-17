# DailyProof Build Notes

These notes prepare DailyProof v1 for Expo/EAS preview builds. Do not submit to app stores from this checklist yet.

## 1. Install EAS CLI

Use EAS CLI through `npx`. The npm package name is `eas-cli`:

```bash
npx eas-cli@latest --version
```

Or install it globally:

```bash
npm install -g eas-cli
```

Check the install:

```bash
eas --version
```

## 2. Log In To Expo

```bash
npx eas-cli@latest login
```

Confirm the active account:

```bash
npx eas-cli@latest whoami
```

## 3. Configure EAS

From the project root:

```bash
npx eas-cli@latest build:configure
```

This project already includes `eas.json`.

Suggested preview profile:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

## 4. Android Preview Build

Use this for a demo APK:

```bash
npx eas-cli@latest build --platform android --profile preview
```

When the build finishes, download and install the APK on an Android device.

## 5. iOS Preview Build Later

iOS builds require an Apple Developer account and device provisioning.

```bash
npx eas-cli@latest build --platform ios --profile preview
```

For TestFlight or App Store release, create separate production settings and review signing, app privacy, and store metadata first.

## Current App Identifiers

Configured in `app.json`:

- App name: `DailyProof`
- Slug: `dailyproof`
- Version: `1.0.0`
- Android package: `com.yourcompany.dailyproof`
- iOS bundle identifier: `com.yourcompany.dailyproof`

Before production, replace `com.yourcompany.dailyproof` with your real organization identifier.

## Permissions

DailyProof uses:

- Camera: capture proof photos.
- Notifications: schedule local goal reminders.

DailyProof does not request gallery upload access in v1.

## Environment Variables

Use `.env.local` for local development and configure matching secrets/environment values for EAS builds.

Required variables are listed in `.env.example`.

For EAS cloud builds, configure environment variables in Expo/EAS:

```bash
npx eas-cli@latest env:create
```

Or manage them from the Expo dashboard for the project.

For the Android preview build, you can sync the local `.env.local` values with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-eas-preview-env.ps1
```

Then rebuild the APK:

```powershell
C:\nvm4w\nodejs\npx.cmd eas-cli@latest build --platform android --profile preview --clear-cache
```

Important: `EXPO_PUBLIC_OPENAI_API_KEY` is client-visible. It is acceptable for local demos only. Before production, move OpenAI verification to Firebase Functions or another backend.

## Verification Before Building

Run:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo start
```
