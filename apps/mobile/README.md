# Farmy Mobile App

React Native mobile application with Expo, WatermelonDB for offline-first storage, and background sync.

## Features (To Be Implemented)

- Phone/Password Authentication
- Offline-first data capture
- Quick-capture flows (lambing, treatment, weights, milk, sales)
- Background sync with conflict resolution
- RFID scanner support (optional)
- Push notifications
- Arabic/English support

## Development

```bash
# From workspace root
pnpm dev

# Or from this directory
pnpm dev

# Run on specific platform
pnpm android
pnpm ios
```

## Tech Stack

- Expo (SDK 50)
- React Native
- WatermelonDB (offline storage)
- React Navigation
- tRPC client
- TypeScript

## Offline Strategy

- Local SQLite database via WatermelonDB
- Outbox pattern for queued mutations
- Background sync every 15 minutes
- Last-Write-Wins conflict resolution
- Tombstones for deleted records

