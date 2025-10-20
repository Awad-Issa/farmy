# Mobile Implementation Guide (Primary Surface)

**Version:** 1.0

## Table of Contents
1. Tech Stack
2. Offline Model & Database
3. Sync Engine
4. Screens & Flows
5. Auth & Tokens
6. Notifications
7. RFID (Optional)
8. Media Capture & Upload
9. Performance Budgets
10. Testing & Release

---

## 1. Tech Stack
- React Native (Expo) + TypeScript
- React Navigation (stack + bottom tabs)
- WatermelonDB (SQLite) for local store
- React Query for network cache where online
- expo-notifications (FCM); BackgroundFetch/TaskManager for periodic sync

## 2. Offline Model & Database
- Watermelon models: animals, cycles, events, weights, yields, sales, reminders, outbox, tombstones.
- Per-farm datasets; farm switch loads/syncs that farm’s records.
- Outbox table stores pending changes with `clientMutationId` and `createdAt`.

## 3. Sync Engine
- **Push**: On connectivity regain or manual, send outbox in batches to `/sync/push`.
- **Pull**: On app resume/interval/pull-to-refresh, call `/sync/pull?since=lastSyncedAt`.
- **Conflict**: LWW; toast if overwrite occurred; keep server snapshot locally; record audit entry.
- Batch size defaults: 500 records/request with exponential backoff on failure.

## 4. Screens & Flows
- **Home**: big CTAs — Add Lambing, Record Treatment, Add Weight, Record Milk, Sell Animal, Sync
- **Animals**: list/search (numeric tag; RFID scan button when enabled)
- **Animal Profile**: timeline chips (Breeding/Health/Weight/Milk/Sales)
- **Tasks/Reminders**: due today/overdue; one-tap complete with timestamp
- **Simple Reports**: today/7d basics
- All forms: minimal typing; numeric pads; defaults from farm settings.

## 5. Auth & Tokens
- Phone OTP via backend/local SMS; store tokens in Expo SecureStore.
- Persist selected farm and language.

## 6. Notifications
- Register FCM token per device; send to backend.
- In-app inbox mirrors pushes; tappable to open target record, works offline with cached copy.

## 7. RFID (Optional)
- Bluetooth Serial/HID reader; read 15-digit code → lookup animal.rfid → open profile.
- Mock adapter for dev.

## 8. Media Capture & Upload
- Store images locally; background uploader with retry/backoff.
- Use presigned URLs from backend for secure upload.

## 9. Performance Budgets
- Cold start < 3s; list scroll @ 60fps with 2k animals.
- Background sync ≤ 2 min/session; respect battery/network conditions.

## 10. Testing & Release
- E2E with Detox for core journeys (offline/online).
- OTA via Expo EAS; store releases for production channels.
