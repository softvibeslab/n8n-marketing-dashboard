# Developer Guide

Technical documentation for developers contributing to or extending the n8n Marketing Dashboard.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Backend Development](#backend-development)
5. [Frontend Development](#frontend-development)
6. [Database Schema](#database-schema)
7. [Testing](#testing)
8. [Code Quality](#code-quality)
9. [Contributing](#contributing)
10. [Deployment](#deployment)

---

## Architecture Overview

### System Architecture

The application follows a three-tier architecture:

```
┌─────────────────────────────────────────┐
│         Frontend Layer (Client)         │
│  React 19 + TypeScript + Vite           │
│  TanStack Query + Zustand               │
└─────────────────────────────────────────┘
                  │
                  │ HTTP/WebSocket
                  ▼
┌─────────────────────────────────────────┐
│       Backend Layer (API Server)        │
│  Node.js + Express + TypeScript         │
│  JWT Auth + Rate Limiting               │
│  Socket.IO (WebSocket)                  │
└─────────────────────────────────────────┘
                  │
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │  External    │
│   Database   │    │   Services   │
│   (Prisma)   │    │  (n8n, AI)  │
└──────────────┘    └──────────────┘
```

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- TanStack Query for server state
- Zustand for client state
- React Router v6 for routing
- Socket.IO client for real-time
- Axios for HTTP requests
- React Hook Form for forms
- Zod for validation

**Backend:**
- Node.js 20+ LTS
- Express.js web framework
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- JWT authentication
- Socket.IO for WebSockets
- Winston for logging
- Zod for validation
- bcrypt for password hashing
- helmet for security headers
- express-rate-limit for rate limiting

**External Services:**
- n8n: Workflow automation
- OpenAI: AI content generation (GPT-4, DALL-E)
- Groq: Fast AI inference
- Google Analytics: Performance tracking
- Mailchimp: Email campaigns
- Social Media APIs: Instagram, Facebook, Twitter, LinkedIn

### Design Patterns

**Service Layer Pattern:**
- Business logic separated from route handlers
- Each domain has a dedicated service
- Services are testable in isolation

**Repository Pattern:**
- Database access through Prisma
- Abstracted in service layer
- Easy to mock for testing

**Middleware Pattern:**
- Request validation
- Authentication
- Rate limiting
- Error handling
- Logging

---

## Development Environment Setup

### Prerequisites

- Node.js 20+ LTS
- npm 10+ or yarn 1.22+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/n8n-marketing-dashboard.git
   cd n8n-marketing-dashboard
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install workspace dependencies
   npm install --workspaces
   ```

3. **Set Up Environment Variables**

   **Backend (`backend/.env`):**
   ```bash
   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/n8n_marketing_dashboard"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
   JWT_ACCESS_EXPIRATION="15m"
   JWT_REFRESH_EXPIRATION="7d"

   # CORS
   CORS_ORIGIN="http://localhost:5173"

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS="60000"
   RATE_LIMIT_MAX_REQUESTS="100"

   # n8n
   N8N_API_URL="http://localhost:5678/api/v1"
   N8N_API_KEY="your-n8n-api-key"
   N8N_WEBHOOK_SECRET="your-webhook-secret"

   # OpenAI
   OPENAI_API_KEY="sk-your-openai-api-key"
   OPENAI_MODEL="gpt-4-turbo-preview"
   OPENAI_MAX_TOKENS="2000"

   # Groq
   GROQ_API_KEY="gsk-your-groq-api-key"

   # Encryption
   ENCRYPTION_KEY="32-character-encryption-key-here"

   # Logging
   LOG_LEVEL="info"
   LOG_FORMAT="json"

   # WebSocket
   WS_PORT="3002"
   WS_PATH="/socket.io/"

   # Environment
   NODE_ENV="development"
   ```

   **Frontend (`frontend/.env`):**
   ```bash
   VITE_API_URL="http://localhost:3001/api/v1"
   VITE_WS_URL="http://localhost:3001"
   ```

4. **Set Up Database**
   ```bash
   cd backend

   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Seed database
   npm run db:seed
   ```

5. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

   Or use the root command:
   ```bash
   npm run dev
   ```

6. **Verify Setup**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Recommended Tools

**IDE:**
- VS Code with recommended extensions
- WebStorm (paid)

**VS Code Extensions:**
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- Prisma
- GitLens

**Database Tools:**
- Prisma Studio: `npm run db:studio`
- pgAdmin
- DBeaver

**API Testing:**
- Postman
- Insomnia
- REST Client (VS Code extension)

---

## Project Structure

### Monorepo Organization

```
n8n-marketing-dashboard/
├── backend/                 # Backend API server
│   ├── prisma/             # Database schema and migrations
│   │   ├── schema.prisma   # Database schema definition
│   │   └── seed.ts         # Database seeding script
│   ├── src/
│   │   ├── config/         # Configuration management
│   │   │   └── index.ts    # Environment config with validation
│   │   ├── middleware/     # Express middleware
│   │   │   ├── auth.ts     # JWT authentication
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validateRequest.ts
│   │   ├── routes/         # API route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── strategy.routes.ts
│   │   │   ├── workflow.routes.ts
│   │   │   ├── asset.routes.ts
│   │   │   ├── campaign.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   ├── assistant.routes.ts
│   │   │   ├── n8n.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── services/       # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── strategy.service.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── workflow.service.ts
│   │   │   ├── n8n.service.ts
│   │   │   ├── asset.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── assistant.service.ts
│   │   ├── schemas/        # Zod validation schemas
│   │   │   ├── strategy.schema.ts
│   │   │   ├── workflow.schema.ts
│   │   │   ├── asset.schema.ts
│   │   │   ├── analytics.schema.ts
│   │   │   └── assistant.schema.ts
│   │   ├── tests/          # Service tests
│   │   │   ├── setup.ts    # Test setup
│   │   │   └── services/   # Service test files
│   │   ├── utils/          # Utility functions
│   │   │   ├── logger.ts   # Winston logger
│   │   │   ├── prisma.ts   # Prisma client
│   │   │   └── asyncHandler.ts
│   │   └── server.ts       # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/               # Frontend application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StrategyInputForm.tsx
│   │   │   └── WorkflowGenerator.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── StrategyPage.tsx
│   │   │   ├── WorkflowsPage.tsx
│   │   │   ├── AssetsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── AssistantChatPage.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useAuth.tsx
│   │   ├── lib/            # Library configurations
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Application entry
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── shared/                 # Shared code
│   └── src/
│       └── types/          # Shared TypeScript types
│           └── index.ts
├── docs/                   # Documentation
├── .moai/                  # MoAI-ADK framework
├── .gitignore
├── package.json           # Root package.json
└── README.md
```

---

## Backend Development

### Adding a New API Endpoint

1. **Create Zod Schema** (`backend/src/schemas/`)

   ```typescript
   import { z } from 'zod';

   export const createItemSchema = z.object({
     name: z.string().min(1).max(255),
     description: z.string().optional(),
     quantity: z.number().int().positive(),
   });

   export const updateItemSchema = createItemSchema.partial();

   export const itemParamsSchema = z.object({
     id: z.string().uuid(),
   });
   ```

2. **Create Service** (`backend/src/services/`)

   ```typescript
   import { prisma } from '../utils/prisma';
   import { createItemSchema, updateItemSchema } from '../schemas/item.schema';

   export const itemService = {
     async createItem(userId: string, data: z.infer<typeof createItemSchema>) {
       return await prisma.item.create({
         data: {
           ...data,
           userId,
         },
       });
     },

     async getItems(userId: string, params: { limit?: number; offset?: number }) {
       return await prisma.item.findMany({
         where: { userId },
         take: params.limit,
         skip: params.offset,
       });
     },

     async getItemById(userId: string, id: string) {
       return await prisma.item.findFirst({
         where: { id, userId },
       });
     },

     async updateItem(userId: string, id: string, data: z.infer<typeof updateItemSchema>) {
       return await prisma.item.update({
         where: { id },
         data,
       });
     },

     async deleteItem(userId: string, id: string) {
       return await prisma.item.delete({
         where: { id },
       });
     },
     // ... more methods
   };
   ```

3. **Create Routes** (`backend/src/routes/`)

   ```typescript
   import express from 'express';
   import { validateRequest } from '../middleware/validateRequest';
   import { asyncHandler } from '../utils/asyncHandler';
   import { itemService } from '../services/item.service';
   import { createItemSchema, updateItemSchema, itemParamsSchema } from '../schemas/item.schema';

   const router = express.Router();

   router.post(
     '/',
     validateRequest({ body: createItemSchema }),
     asyncHandler(async (req, res) => {
       const item = await itemService.createItem(req.user.id, req.body);
       res.status(201).json({ success: true, data: item });
     })
   );

   router.get(
     '/',
     asyncHandler(async (req, res) => {
       const items = await itemService.getItems(req.user.id, req.query);
       res.json({ success: true, data: items });
     })
   );

   router.get(
     '/:id',
     validateRequest({ params: itemParamsSchema }),
     asyncHandler(async (req, res) => {
       const item = await itemService.getItemById(req.user.id, req.params.id);
       if (!item) {
         return res.status(404).json({
           success: false,
           error: { code: 'NOT_FOUND', message: 'Item not found' },
         });
       }
       res.json({ success: true, data: item });
     })
   );

   export default router;
   ```

4. **Register Routes** (`backend/src/server.ts`)

   ```typescript
   import itemRoutes from './routes/item.routes';

   app.use('/api/v1/items', authMiddleware, itemRoutes);
   ```

### Service Layer Best Practices

- **Single Responsibility**: Each service handles one domain
- **Error Handling**: Service methods throw errors, let middleware handle them
- **Validation**: Validate input with Zod before passing to services
- **Database Operations**: Use Prisma client for all database access
- **Business Logic**: Keep business logic in services, not routes
- **Testing**: Services should be easily testable in isolation

### Middleware

**Validation Middleware:**
```typescript
export const validateRequest = ({ body, params, query }: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (params) req.params = params.parse(req.params);
      if (query) req.query = query.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
};
```

**Authentication Middleware:**
```typescript
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
    });
  }
};
```

---

## Frontend Development

### Component Structure

**Page Component:**
```typescript
// frontend/src/pages/ItemsPage.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function ItemsPage() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: () => api.get('/items').then(res => res.data.data),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading items</div>;

  return (
    <div>
      <h1>Items</h1>
      {items?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

**Reusable Component:**
```typescript
// frontend/src/components/ItemCard.tsx
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onEdit?: (item: Item) => void;
  onDelete?: (id: string) => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  return (
    <div className="border rounded p-4">
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <button onClick={() => onEdit?.(item)}>Edit</button>
      <button onClick={() => onDelete?.(item.id)}>Delete</button>
    </div>
  );
}
```

### State Management

**Server State (TanStack Query):**
```typescript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['items', itemId],
  queryFn: () => api.get(`/items/${itemId}`).then(res => res.data.data),
});

const mutation = useMutation({
  mutationFn: (data: CreateItemInput) =>
    api.post('/items', data).then(res => res.data.data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

**Client State (Zustand):**
```typescript
// frontend/src/stores/useItemStore.ts
import { create } from 'zustand';

interface ItemStore {
  selectedItems: string[];
  toggleItem: (id: string) => void;
  clearSelection: () => void;
}

export const useItemStore = create<ItemStore>((set) => ({
  selectedItems: [],
  toggleItem: (id) => set((state) => ({
    selectedItems: state.selectedItems.includes(id)
      ? state.selectedItems.filter((itemId) => itemId !== id)
      : [...state.selectedItems, id],
  })),
  clearSelection: () => set({ selectedItems: [] }),
}));
```

### Form Handling

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export function ItemForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ItemFormData) => api.post('/items', data),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <textarea {...register('description')} />
      {errors.description && <span>{errors.description.message}</span>}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

---

## Database Schema

### Prisma Schema

The database schema is defined in `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String?
  role          Role      @default(USER)
  apiKeys       Json?
  preferences   Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  strategies    Strategy[]
  workflows     Workflow[]
  campaigns     Campaign[]
  assets        Asset[]
  conversations Conversation[]
}

model Strategy {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  strategy    Json
  status      StrategyStatus @default(DRAFT)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  campaigns   Campaign[]
}

model Workflow {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name            String
  description     String?
  n8nWorkflowJson Json
  status          WorkflowStatus @default(DRAFT)
  n8nWorkflowId   String?   @unique
  version         Int       @default(1)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  executions      Execution[]
  campaigns       Campaign[]
}

model Campaign {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workflowId  String?
  workflow    Workflow? @relation(fields: [workflowId], references: [id])
  strategyId  String?
  strategy    Strategy? @relation(fields: [strategyId], references: [id])
  name        String
  status      CampaignStatus @default(DRAFT)
  metrics     Json?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  assets      Asset[]
}

model Asset {
  id          String       @id @default(uuid())
  campaignId  String?
  campaign    Campaign?    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  type        AssetType
  content     String       @db.Text
  fileUrl     String?
  metadata    Json?
  status      AssetStatus @default(DRAFT)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Execution {
  id             String    @id @default(uuid())
  workflowId     String
  workflow       Workflow  @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  status         ExecutionStatus
  startedAt      DateTime
  completedAt    DateTime?
  logs           Json?
  errorMessage   String?   @db.Text
}

model Conversation {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages    Json
  context     Json?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  ADMIN
  USER
  VIEWER
}

enum StrategyStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum WorkflowStatus {
  DRAFT
  DEPLOYED
  ARCHIVED
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
}

enum AssetType {
  TEXT
  IMAGE
  VIDEO
  DESIGN
}

enum AssetStatus {
  DRAFT
  GENERATED
  APPROVED
}

enum ExecutionStatus {
  RUNNING
  SUCCESS
  FAILED
}
```

### Database Migrations

**Creating a Migration:**
```bash
# Modify schema.prisma
npm run db:push  # Development
npm run db:migrate  # Production
```

**Resetting Database:**
```bash
npm run db:push -- --force-reset
```

**Viewing Data:**
```bash
npm run db:studio
```

---

## Testing

### Backend Testing

**Service Test Example:**
```typescript
// backend/src/tests/services/item.service.test.ts
import { itemService } from '../../services/item.service';
import { prisma } from '../../utils/prisma';

describe('ItemService', () => {
  beforeEach(async () => {
    await prisma.item.deleteMany();
  });

  describe('createItem', () => {
    it('should create an item', async () => {
      const item = await itemService.createItem('user-id', {
        name: 'Test Item',
        quantity: 10,
      });

      expect(item).toHaveProperty('id');
      expect(item.name).toBe('Test Item');
      expect(item.quantity).toBe(10);
    });
  });

  describe('getItems', () => {
    it('should return items for user', async () => {
      await itemService.createItem('user-id', {
        name: 'Item 1',
        quantity: 5,
      });

      const items = await itemService.getItems('user-id', {});
      expect(items).toHaveLength(1);
    });
  });
});
```

**Run Tests:**
```bash
cd backend
npm test                    # Run tests once
npm run test:watch          # Watch mode
npm test -- --coverage      # With coverage
```

### Frontend Testing

**Component Test Example:**
```typescript
// frontend/src/components/__tests__/ItemCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ItemCard } from '../ItemCard';

describe('ItemCard', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    description: 'Test description',
  };

  it('renders item details', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<ItemCard item={mockItem} onEdit={onEdit} />);

    screen.getByText('Edit').click();
    expect(onEdit).toHaveBeenCalledWith(mockItem);
  });
});
```

**Run Tests:**
```bash
cd frontend
npm test                    # Run tests
npm run test:ui             # UI mode
npm run test:watch          # Watch mode
```

---

## Code Quality

### TypeScript Configuration

**Strict Mode Enabled:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### ESLint Rules

**Backend (.eslintrc.json):**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn"
  }
}
```

### Code Formatting

**Prettier Configuration (.prettierrc):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Contributing

### Git Workflow

1. **Branch Naming**
   - Feature: `feature/feature-name`
   - Bugfix: `bugfix/bug-description`
   - Hotfix: `hotfix/critical-fix`

2. **Commit Messages**
   - Follow Conventional Commits
   - Examples:
     - `feat: add workflow generation endpoint`
     - `fix: resolve auth token expiration issue`
     - `docs: update API documentation`

3. **Pull Request Process**
   - Create PR from branch to main
   - Include description of changes
   - Reference related issues
   - Ensure CI checks pass
   - Request review from maintainers

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log or debugger statements
- [ ] Environment variables documented
- [ ] Error handling implemented
- [ ] TypeScript strict mode compliant
- [ ] Tests passing with coverage > 85%

---

## Deployment

See [Deployment Guide](../deployment/README.md) for detailed deployment instructions.

---

**Version:** 1.0.0
**Last Updated:** 2026-01-31
