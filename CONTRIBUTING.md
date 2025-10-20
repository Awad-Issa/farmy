# Contributing to Farmy

## Development Setup

### 1. Install Dependencies

```bash
# Install PNPM globally if you haven't
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Set Up Environment Variables

```bash
# Copy the environment template
cp ENV_EXAMPLE.txt .env

# Edit .env with your actual values
# - DATABASE_URL: Your PostgreSQL connection string
# - JWT secrets: Generate secure random strings (min 32 chars)
# - Storage credentials: DigitalOcean Spaces or AWS S3
# - FCM credentials: Firebase project settings
```

### 3. Set Up Database

```bash
# After creating Prisma schema, generate the client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Open Prisma Studio to view data
pnpm db:studio
```

### 4. Start Development

```bash
# Start all apps in development mode
pnpm dev

# Or start individually
cd apps/web && pnpm dev      # Web app on :3000
cd apps/mobile && pnpm dev   # Mobile app with Expo
```

## Project Guidelines

### Code Style

- **TypeScript** everywhere - no JavaScript files
- **Functional components** with hooks (no class components)
- **Arrow functions** for component definitions
- **Named exports** preferred over default exports (except for Next.js pages)

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types/Interfaces**: PascalCase with descriptive names
- **Event handlers**: `handle` prefix (e.g., `handleSubmit`, `handleClick`)

### File Organization

```
packages/
  {package}/
    src/
      index.ts          # Main export
      *.ts              # Implementation files
    package.json
    tsconfig.json
    .eslintrc.js

apps/
  web/
    src/
      app/              # Next.js App Router pages
      components/       # React components
      lib/              # Utilities and configurations
    package.json

  mobile/
    app/                # Expo Router screens
    database/           # WatermelonDB schema and models
    sync/               # Offline sync logic
    package.json
```

### TypeScript

- **Always** provide explicit types for:
  - Function parameters
  - Function return types
  - React component props
  - State variables (when not inferred)
- Use **interfaces** for object shapes
- Use **type** for unions, intersections, and utilities
- Avoid `any` - use `unknown` if type is truly unknown

### React Guidelines

#### Component Structure

```typescript
import { type FC } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  // 1. Hooks
  const [state, setState] = useState(false);
  
  // 2. Event handlers
  const handleClick = () => {
    setState(true);
    onAction();
  };
  
  // 3. Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click</button>
    </div>
  );
};
```

#### Hooks Order

1. Context hooks (`useContext`)
2. State hooks (`useState`, `useReducer`)
3. Effect hooks (`useEffect`, `useLayoutEffect`)
4. Custom hooks
5. Refs (`useRef`)
6. Memoization (`useMemo`, `useCallback`)

### API Development (tRPC)

```typescript
// packages/api/src/routers/example.ts
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const exampleRouter = router({
  list: protectedProcedure
    .input(z.object({
      farmId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      // Implementation
      return { items: [], total: 0 };
    }),
    
  create: protectedProcedure
    .input(z.object({
      farmId: z.string().uuid(),
      name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
      return { id: 'uuid', ...input };
    }),
});
```

### Database (Prisma)

- Always use **camelCase** for model and field names
- Add `@db.*` annotations for specific column types
- Use `@updatedAt` for automatic timestamp updates
- Add indexes on frequently queried fields

```prisma
model Animal {
  id        String   @id @default(uuid())
  farmId    String
  tagNumber String
  type      AnimalType
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  farm      Farm     @relation(fields: [farmId], references: [id])
  
  @@unique([farmId, tagNumber])
  @@index([farmId, updatedAt])
  @@map("animals")
}
```

### Validation (Zod)

- Create reusable schemas in `packages/validators`
- Export both schema and inferred type

```typescript
// packages/validators/src/animal.ts
import { z } from 'zod';

export const createAnimalInputSchema = z.object({
  farmId: z.string().uuid(),
  tagNumber: z.string().min(1).max(20),
  type: z.enum(['RAM', 'EWE', 'LAMB']),
  rfid: z.string().length(15).optional(),
});

export type CreateAnimalInput = z.infer<typeof createAnimalInputSchema>;
```

### Testing

```typescript
// Basic structure for tests
describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' };
    
    // Act
    render(<MyComponent {...props} />);
    
    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Git Workflow

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add animal search functionality
fix: resolve breeding cycle date calculation
docs: update API documentation
refactor: simplify cost resolver logic
test: add tests for auth flow
chore: update dependencies
```

#### Branch Naming

```
feature/animal-search
fix/breeding-date-bug
refactor/cost-resolver
docs/api-guide
```

## Common Tasks

### Add a New Package

```bash
mkdir -p packages/my-package/src
cd packages/my-package

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@farmy/my-package",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "devDependencies": {
    "@farmy/config": "workspace:*",
    "typescript": "^5.3.2"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "@farmy/config/typescript.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
EOF

# Create index file
echo "export const placeholder = 'Implementation here';" > src/index.ts

# Install dependencies
cd ../.. && pnpm install
```

### Add a Dependency

```bash
# To a specific package
cd packages/my-package
pnpm add some-dependency

# To workspace root (devDependencies)
pnpm add -Dw some-tool

# Across multiple packages
pnpm add --filter "@farmy/web" --filter "@farmy/mobile" react-query
```

### Run Type Checking

```bash
# All packages
pnpm type-check

# Specific package
cd packages/api
pnpm type-check
```

### Format Code

```bash
# Format all files
pnpm format

# Format specific files
pnpm prettier --write "packages/api/src/**/*.ts"
```

## Need Help?

- Check [PLAN.md](docs/PLAN.md) for architecture and implementation details
- Review [farmy-guide/](farmy-guide/) for business requirements
- Ask the team in your communication channel

---

Happy coding! 🚀

