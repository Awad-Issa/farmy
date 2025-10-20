# Farmy - Farm Management System

A mobile-first, offline-first farm management system for Palestinian small-to-medium sheep farms. Built with TypeScript, Next.js, Expo, and tRPC in a Turborepo monorepo.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PNPM 8+
- PostgreSQL 15+

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API keys

# Generate Prisma client (after creating schema)
pnpm db:generate

# Run database migrations (after creating schema)
pnpm db:migrate

# Start development servers
pnpm dev
```

### Development URLs

- **Web App**: http://localhost:3000
- **Mobile**: Use Expo Go app or simulator
- **Prisma Studio**: `pnpm db:studio`

## 📁 Project Structure

```
farmy/
├── apps/
│   ├── web/          # Next.js 14 web app (Chakra UI + tRPC)
│   └── mobile/       # Expo mobile app (React Native + WatermelonDB)
├── packages/
│   ├── api/          # tRPC routers (business logic)
│   ├── db/           # Prisma schema and client
│   ├── validators/   # Zod validation schemas
│   ├── auth/         # JWT + Argon2id authentication
│   ├── ui/           # Chakra UI theme and components
│   ├── config/       # Shared TypeScript, ESLint, Prettier configs
│   └── utils/        # Shared utilities (date, phone, currency)
├── docs/             # Documentation and guides
├── turbo.json        # Turborepo pipeline configuration
└── pnpm-workspace.yaml
```

## 🛠️ Tech Stack

### Web Frontend
- **Next.js 14** - React framework with App Router
- **Chakra UI** - Component library with RTL support
- **tRPC** - Type-safe API calls
- **React Query** - Data fetching and caching
- **NextAuth** - Authentication
- **React Hook Form + Zod** - Form validation

### Mobile App
- **Expo** - React Native framework
- **WatermelonDB** - Offline-first SQLite database
- **React Navigation** - Navigation
- **tRPC Client** - Type-safe API integration
- **Expo SecureStore** - Secure token storage

### Backend (API)
- **tRPC** - Type-safe API framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Argon2id** - Password hashing
- **JWT** - Authentication tokens

### DevOps
- **Turborepo** - Monorepo build system
- **PNPM** - Fast, disk-efficient package manager
- **TypeScript** - Type safety across all packages
- **ESLint + Prettier** - Code quality and formatting

## 📦 Available Scripts

### Root Commands

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps for production
pnpm lint         # Lint all packages
pnpm type-check   # Type check all packages
pnpm format       # Format code with Prettier
pnpm clean        # Clean build artifacts and node_modules

# Database commands
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
```

### App-Specific Commands

```bash
# Web app
cd apps/web
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Mobile app
cd apps/mobile
pnpm dev          # Start Expo dev server
pnpm android      # Run on Android
pnpm ios          # Run on iOS
```

## 🎯 Key Features (MVP)

1. **Breeding & Pregnancy Management** - Track breeding cycles, pregnancy checks, due dates, and lambing events
2. **Health & Treatment Tracking** - Record diagnoses, treatments, withdrawal periods
3. **Weight & Feed Management** - Batch weight entry, ADG calculations, feed tracking
4. **Milk & Sales Recording** - Daily milk yields, milk sales, animal sales
5. **Inventory & Cost Tracking** - Multi-level cost resolver with confidence badges
6. **Insights & Causality Analysis** - Relate actions to outcomes using statistical methods

## 🔐 Authentication

- **Phone + Password** authentication (no email required)
- **Argon2id** password hashing (GPU-attack resistant)
- **JWT** access tokens (30 min) + refresh tokens (30 days)
- **Refresh token rotation** for enhanced security
- **Multi-farm support** with role-based access control (Owner, Admin, Worker, Vet)

## 🌍 Internationalization

- **Arabic** and **English** support
- **RTL (Right-to-Left)** layout support in Chakra UI
- Localized date and number formats

## 📱 Offline-First Mobile

- **WatermelonDB** local SQLite storage
- **Outbox pattern** for queued mutations
- **Background sync** every 15 minutes
- **Last-Write-Wins** conflict resolution
- **Tombstones** for deleted record handling

## 🔄 Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** in the appropriate package/app

3. **Run type-check and lint**
   ```bash
   pnpm type-check
   pnpm lint
   ```

4. **Test your changes**
   - Web: http://localhost:3000
   - Mobile: Expo Go or simulator

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

## 📚 Documentation

- **[PLAN.md](docs/PLAN.md)** - Complete implementation plan
- **[Business Requirements](farmy-guide/Business_Requirements_Document.md)** - Full requirements
- **[API Guide](farmy-guide/API_Guide.md)** - API documentation
- **[Frontend Guide](farmy-guide/Frontend_Implementation_Guide.md)** - Frontend patterns
- **[Mobile Guide](farmy-guide/Mobile_Implementation_Guide.md)** - Mobile development
- **[Backend Guide](farmy-guide/Backend_Implementation_Guide.md)** - Backend architecture

## 🚧 Current Status

- ✅ Monorepo structure created
- ✅ Shared packages configured (config, utils, stubs for api, db, validators, auth, ui)
- ✅ Apps scaffolded (web, mobile)
- ⏳ Prisma schema (to be implemented in Phase 1)
- ⏳ tRPC routers (to be implemented in Phase 2)
- ⏳ Web UI (to be implemented in Phase 3)
- ⏳ Mobile UI (to be implemented in Phase 4)

## 📋 Next Steps

See [PLAN.md](docs/PLAN.md) for the complete implementation plan.

**Phase 1: Foundation** (Current)
1. Create Prisma schema with all 30 models
2. Create Zod validators for all domains
3. Set up tRPC with authentication middleware

**Phase 2: Core API**
- Implement all tRPC routers (auth, farms, animals, breeding, health, etc.)

**Phase 3: Web Frontend**
- Build Next.js pages and forms with Chakra UI

**Phase 4: Mobile App**
- Implement WatermelonDB schema and sync engine
- Build quick-capture flows

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. See CONTRIBUTING.md for development guidelines.

---

Built with ❤️ for Palestinian farmers

