# Farmy Quick Start 🚀

## Installation (3 Steps)

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp ENV_EXAMPLE.txt .env
# Edit .env with your database URL and secrets

# 3. Start development
pnpm dev
```

## What You Get

- 🌐 **Web App**: http://localhost:3000
- 📱 **Mobile App**: Expo dev server (scan QR code)

## Common Commands

```bash
pnpm dev          # Start all apps
pnpm build        # Build for production
pnpm lint         # Lint code
pnpm type-check   # Check TypeScript
pnpm format       # Format with Prettier
```

## Project Structure

```
farmy/
├── apps/
│   ├── web/          # Next.js web app
│   └── mobile/       # Expo mobile app
└── packages/
    ├── api/          # tRPC routers
    ├── db/           # Prisma database
    ├── validators/   # Zod schemas
    ├── auth/         # Authentication
    ├── ui/           # UI components
    ├── utils/        # Utilities
    └── config/       # Shared configs
```

## Next Steps

1. ✅ Monorepo created
2. ⏳ Create Prisma schema (`packages/db/`)
3. ⏳ Create Zod validators (`packages/validators/`)
4. ⏳ Implement tRPC routers (`packages/api/`)
5. ⏳ Build UI (`apps/web/` and `apps/mobile/`)

## Need Help?

- 📖 Full setup: `SETUP.md`
- 🛠️ Development: `CONTRIBUTING.md`
- 📋 Plan: `docs/PLAN.md`
- 📚 Requirements: `farmy-guide/`

---

**Built for Palestinian farmers with ❤️**

