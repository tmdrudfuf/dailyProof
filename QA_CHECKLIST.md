# DailyProof v1 Release QA Checklist

Use this checklist after creating an EAS preview build and installing it on an Android device.

Build tested:

- Build URL:
- Build profile: `preview`
- Device:
- Tester:
- Date:

Status legend:

- Not tested
- Pass
- Fail
- Blocked
- Fixed

| Area | Test case | Expected result | Status | Bugs found | Fix status |
| --- | --- | --- | --- | --- | --- |
| Install | Install app on Android device from EAS APK link | App installs successfully and opens without crashing | Not tested |  |  |
| Auth | Sign up with display name, email, and password | User account is created and app enters main tabs | Not tested |  |  |
| Auth | Log out, then log in with the same account | User can log back in and profile data loads | Not tested |  |  |
| Profile | User profile appears after login | Display name, username, streak/stat summary appear | Not tested |  |  |
| Goals | Create a new goal | Goal is saved and appears in My Goals | Not tested |  |  |
| Goals | Try creating more than 3 active goals | App blocks adding more than 3 active goals | Not tested |  |  |
| Goals | Delete a goal | Confirmation appears and goal is removed after confirming | Not tested |  |  |
| Camera | Open Camera tab with no goals | Friendly empty state appears | Not tested |  |  |
| Camera | Open Camera tab with active goals | Active goals appear and can be selected | Not tested |  |  |
| Camera | Camera permission prompt | Permission message is readable and camera opens after approval | Not tested |  |  |
| Camera | Deny camera permission | App shows readable permission state and does not crash | Not tested |  |  |
| Check-in | Take proof photo | Captured photo preview appears | Not tested |  |  |
| Check-in | Retake proof photo | User can return to camera and take another photo | Not tested |  |  |
| Storage | Submit proof photo | Photo uploads to Firebase Storage under `checkIns/{userId}/{checkInId}.jpg` | Not tested |  |  |
| AI | OpenAI verification approves valid proof | Result screen shows approved status, confidence, and feedback | Not tested |  |  |
| AI | OpenAI verification warning/rejected path | App shows warning/rejected result and allows/requires retake | Not tested |  |  |
| Check-in | Approved check-in creation | Firestore `checkIns` document is created with final Storage URL | Not tested |  |  |
| Goals | Goal progress update | `completedDays` increments after first approved check-in of the day | Not tested |  |  |
| Goals | Multiple check-ins same day | Multiple check-ins are allowed, but `completedDays` increments only once | Not tested |  |  |
| Feed | Feed update after check-in | New check-in appears at the top of the feed | Not tested |  |  |
| Feed | Pull to refresh feed | Feed reloads without stuck loading state | Not tested |  |  |
| Friends | Search for another user | Search results show display name, username, and Add Friend button | Not tested |  |  |
| Friends | Send friend request | Request is sent and outgoing/incoming states update correctly | Not tested |  |  |
| Friends | Accept friend request from second account | Users become friends and appear in Current Friends | Not tested |  |  |
| Friend Feed | Friend-visible goal check-in appears | Friend can see check-ins for goals with `Friends` visibility | Not tested |  |  |
| Friend Feed | Public goal check-in appears | Friend or signed-in user can see public check-ins where allowed by rules | Not tested |  |  |
| Friend Feed | Private goal hidden from friends | Friend cannot see private goal check-ins in feed | Not tested |  |  |
| Reactions | React to own or friend check-in | Reaction appears immediately and persists after refresh | Not tested |  |  |
| Reactions | Remove reaction | Reaction toggles off and does not duplicate | Not tested |  |  |
| Comments | Add comment to feed post | Comment appears and persists after refresh | Not tested |  |  |
| Comments | Reply to comment | Reply appears under the parent comment | Not tested |  |  |
| Mentions | Mention a friend with `@` | Friend suggestion appears and selected mention is highlighted | Not tested |  |  |
| Reminders | Create goal with reminder time | Local notification is scheduled if permission is granted | Not tested |  |  |
| Reminders | Deny notification permission | App remains usable and shows readable reminder warning | Not tested |  |  |
| History | Open History & Stats | Past check-ins appear grouped by date | Not tested |  |  |
| History | Filter by goal/category | History list updates and can be cleared/toggled | Not tested |  |  |
| History | Analytics values | Total check-ins, completion rate, common time block, and average time render | Not tested |  |  |
| Persistence | Close and reopen app | Login state, goals, check-ins, feed data, and friend data restore correctly | Not tested |  |  |
| Auth | Logout and login again | App returns to Auth stack, then reloads user profile after login | Not tested |  |  |

## Known Limitations

- OpenAI verification currently uses a client-visible `EXPO_PUBLIC_OPENAI_API_KEY` for demo builds. Move verification to Firebase Functions or another backend before production.
- Expo Go has limitations for notification testing. Use an EAS preview build for more realistic notification behavior.
- Friend search depends on readable user profile data in the current MVP. Production should use a public profile index or backend search.
- Local reminders are device-local only. Server push notifications are not implemented yet.
- Android APK preview builds are for internal testing only and are not submitted to app stores.
- iOS preview builds require Apple Developer setup and device provisioning.

## Bugs Found

| ID | Date | Area | Description | Severity | Status | Fix notes |
| --- | --- | --- | --- | --- | --- | --- |
| QA-001 |  |  |  |  | Not started |  |
| QA-002 |  |  |  |  | Not started |  |
| QA-003 |  |  |  |  | Not started |  |

