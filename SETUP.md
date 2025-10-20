# Farmy Setup Instructions

## ✅ Phase 0 Complete - Monorepo Structure Created

The Farmy TypeScript monorepo has been successfully scaffolded following the PLAN.md specification.

## 📁 What Was Created

### Root Configuration
- ✅ `pnpm-workspace.yaml` - PNPM workspace configuration
- ✅ `turbo.json` - Turborepo build pipeline
- ✅ `package.json` - Root package with scripts
- ✅ `.gitignore` - Git ignore rules
- ✅ `ENV_EXAMPLE.txt` - Environment variables template
- ✅ `.prettierrc.js` - Prettier configuration
- ✅ `.eslintrc.js` - Root ESLint configuration

### Packages (Shared Code)

#### `packages/config/` ✅
Complete configuration package with:
- TypeScript base configuration
- ESLint configs (base, Next.js, React)
- Prettier configuration

#### `packages/utils/` ✅
Utility functions:
- `date.ts` - Date formatting and calculations
- `phone.ts` - Phone number normalization and validation
- `currency.ts` - Currency formatting
- `validation.ts` - Password strength, RFID, tag validation

#### `packages/api/` ✅ (Stub)
tRPC API routers placeholder
- Will contain all business logic routers in Phase 2

#### `packages/db/` ✅ (Stub)
Prisma database package
- Will contain Prisma schema and client in Phase 1

#### `packages/validators/` ✅ (Stub)
Zod validation schemas
- Will contain all input/output schemas in Phase 1

#### `packages/auth/` ✅ (Stub)
Authentication utilities
- Will contain JWT helpers and Argon2id password utilities in Phase 3

#### `packages/ui/` ✅ (Stub)
UI components and Chakra theme
- Will contain shared components in Phase 4

### Applications

#### `apps/web/` ✅
Next.js 14 web application:
- App Router structure
- Basic layout and page
- TypeScript configuration
- ESLint configuration
- README with instructions

#### `apps/mobile/` ✅
Expo mobile application:
- Expo Router structure
- Basic home screen
- TypeScript configuration
- app.json configuration
- README with instructions

### Documentation
- ✅ `README.md` - Project overview and quick start
- ✅ `CONTRIBUTING.md` - Development guidelines
- ✅ `SETUP.md` - This file

## 🚀 Next Steps

### 1. Install Dependencies

```bash
# Install PNPM globally if not installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

This will install dependencies for all packages and apps.

### 2. Set Up Environment Variables

```bash
# Copy the environment template
cp ENV_EXAMPLE.txt .env

# Edit .env with your values:
# - PostgreSQL connection string
# - JWT secrets (generate secure random strings)
# - Storage credentials (DigitalOcean Spaces or AWS S3)
# - Firebase credentials for push notifications
```

### 3. Start Development

```bash
# Start all apps in development mode
pnpm dev
```

**Current behavior:**
- Web app will start on http://localhost:3000 (placeholder page)
- Mobile app will start Expo dev server (placeholder screen)

### 4. Proceed to Phase 1

According to PLAN.md, the next steps are:

**Phase 1: Shared Packages Implementation**

1. **Create Prisma Schema** (`packages/db/`)
   - Define all 30+ models (User, Farm, Animal, etc.)
   - Add User.phone unique constraint
   - Add passwordHash field
   - Run `pnpm db:generate`

2. **Create Zod Validators** (`packages/validators/`)
   - Auth schemas (phone, password validation)
   - Animal schemas
   - Breeding, health, weight schemas
   - All other domain schemas

3. **Set Up tRPC** (`packages/api/`)
   - Create tRPC context with JWT middleware
   - Set up base router structure
   - Add authentication procedures

4. **Create Auth Utilities** (`packages/auth/`)
   - Argon2id hash/verify functions
   - JWT sign/verify/decode helpers
   - RBAC policy helpers
   - NextAuth configuration

## 📋 Verification Checklist

Before proceeding, verify:

- [ ] All files created successfully
- [ ] `pnpm install` runs without errors
- [ ] No TypeScript errors (run `pnpm type-check`)
- [ ] Directory structure matches PLAN.md §13
- [ ] All package.json files have correct workspace dependencies

## 🔍 Project Structure Summary

```
farmy/
├── apps/
│   ├── web/              ✅ Next.js web app placeholder
│   └── mobile/           ✅ Expo mobile app placeholder
├── packages/
│   ├── config/           ✅ TypeScript, ESLint, Prettier configs
│   ├── utils/            ✅ Date, phone, currency, validation utilities
│   ├── api/              ✅ Stub (Phase 2)
│   ├── db/               ✅ Stub (Phase 1)
│   ├── validators/       ✅ Stub (Phase 1)
│   ├── auth/             ✅ Stub (Phase 3)
│   └── ui/               ✅ Stub (Phase 4)
├── docs/                 📚 Existing documentation
├── farmy-guide/          📚 Existing requirements
├── pnpm-workspace.yaml   ✅ Workspace configuration
├── turbo.json            ✅ Build pipeline
├── package.json          ✅ Root scripts
├── ENV_EXAMPLE.txt       ✅ Environment template
├── README.md             ✅ Project overview
├── CONTRIBUTING.md       ✅ Development guidelines
└── SETUP.md              ✅ This file
```

## 🎯 Available Scripts

### Workspace Root Commands

```bash
pnpm dev          # Start all apps in development
pnpm build        # Build all apps for production
pnpm lint         # Lint all packages
pnpm type-check   # Type check all packages
pnpm format       # Format code with Prettier
pnpm clean        # Clean build artifacts

# Database commands (after Prisma schema is created)
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
```

### Per-App Commands

```bash
# Web app
cd apps/web
pnpm dev          # Next.js dev server
pnpm build        # Build for production
pnpm lint         # Lint web app
pnpm type-check   # Type check web app

# Mobile app
cd apps/mobile
pnpm dev          # Expo dev server
pnpm android      # Run on Android
pnpm ios          # Run on iOS
pnpm lint         # Lint mobile app
pnpm type-check   # Type check mobile app
```

## ⚠️ Known Items

### Empty Folders
The following folders exist but are empty (can be removed):
- `farmy-be/` - Not needed (monorepo uses packages/api instead)
- `farmy-fe/` - Not needed (monorepo uses apps/web instead)
- `farmy-mobile/` - Not needed (monorepo uses apps/mobile instead)

You can safely delete these:
```bash
rmdir farmy-be farmy-fe farmy-mobile
```

## 📚 Reference Documents

- **Implementation Plan**: [docs/PLAN.md](docs/PLAN.md)
- **Business Requirements**: [farmy-guide/Business_Requirements_Document.md](farmy-guide/Business_Requirements_Document.md)
- **API Guide**: [farmy-guide/API_Guide.md](farmy-guide/API_Guide.md)
- **Frontend Guide**: [farmy-guide/Frontend_Implementation_Guide.md](farmy-guide/Frontend_Implementation_Guide.md)
- **Mobile Guide**: [farmy-guide/Mobile_Implementation_Guide.md](farmy-guide/Mobile_Implementation_Guide.md)

## 🤔 Questions?

Refer to:
1. `PLAN.md` - Complete implementation roadmap
2. `CONTRIBUTING.md` - Development guidelines and patterns
3. `README.md` - Project overview
4. Package READMEs - Package-specific documentation

---

**Status**: Phase 0 Complete ✅  
**Next**: Phase 1 - Create Prisma Schema and Zod Validators  
**Ready for**: `pnpm install` and development

Built with ❤️ for Palestinian farmers

