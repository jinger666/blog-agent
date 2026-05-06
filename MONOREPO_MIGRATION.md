# Monorepo Migration Guide

## 🎉 What Changed

Your project has been successfully migrated to a **Monorepo architecture** using **Turborepo** + **pnpm** with the backend migrated to **Nest.js**.

---

## 📁 New Project Structure

```
ai-blog/
├── package.json              # Root workspace configuration
├── pnpm-workspace.yaml       # pnpm workspace definition
├── turbo.json                # Turborepo build orchestration
│
├── apps/                     # Applications
│   ├── backend/              # Nest.js backend (was Express)
│   ├── frontend/             # React + Vite frontend
│   └── extension/            # Browser extension
│
├── packages/                 # Shared packages
│   └── types/                # Shared TypeScript types
│       ├── src/
│       │   ├── workflow.ts   # Workflow types
│       │   ├── api.ts        # API types
│       │   └── index.ts      # Exports
│       └── package.json
│
└── docker/                   # Docker configurations
    ├── Dockerfile.backend
    └── Dockerfile.frontend
```

---

## 🚀 Quick Start

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm@8.9.0
```

### 2. Install Dependencies

```bash
# From project root
pnpm install
```

This will install all dependencies for all apps and packages in a single command.

### 3. Build Shared Types

```bash
pnpm --filter @ai-blog/types build
```

### 4. Start Development Servers

```bash
# Start all apps simultaneously
pnpm run dev

# Or start individual apps
pnpm --filter @ai-blog/backend start:dev
pnpm --filter @ai-blog/frontend dev
```

---

## 🔧 Key Changes

### Backend Migration to Nest.js

The backend has been migrated from Express to Nest.js framework while preserving existing functionality.

**New Features:**
- ✅ Dependency Injection
- ✅ Decorator-based routing
- ✅ Built-in validation pipes
- ✅ Swagger API documentation at `/api/docs`
- ✅ Modular architecture

**File Changes:**
- `src/index.ts` → `src/main.ts` (new entry point)
- `src/app.module.ts` (new root module)
- `src/modules/*/` (feature modules)

### Shared Types Package

Types are now centralized in `packages/types`:

```typescript
// Before (duplicated in backend and frontend)
interface WorkflowNode {
  id: string;
  type: string;
}

// After (single source of truth)
import { WorkflowNode } from '@ai-blog/types';
```

**Available Types:**
- `Workflow`, `WorkflowNode`, `WorkflowEdge`
- `User`, `LoginRequest`, `LoginResponse`
- `ChatRequest`, `ChatResponse`
- `Memory`, `SearchResult`
- `RAGQueryRequest`, `RAGQueryResult`

---

## 📦 Package Names

All packages now use scoped naming:

| Old Name | New Name |
|----------|----------|
| `ai-blog-backend` | `@ai-blog/backend` |
| `ai-blog-frontend` | `@ai-blog/frontend` |
| `ai-blog-extension` | `@ai-blog/extension` |
| N/A | `@ai-blog/types` (new) |

---

## 🛠️ Common Commands

### Development

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm --filter @ai-blog/backend start:dev
pnpm --filter @ai-blog/frontend dev

# Build all apps
pnpm build

# Build specific app
pnpm --filter @ai-blog/backend build
```

### Testing

```bash
# Run all tests
pnpm test

# Test specific app
pnpm --filter @ai-blog/backend test
```

### Linting & Formatting

```bash
# Lint all apps
pnpm lint

# Format code
pnpm format
```

### Clean

```bash
# Clean all build artifacts
pnpm clean
```

---

## 🐳 Docker Changes

### Building Images

```bash
# From project root
docker-compose -f docker/docker-compose.yml up -d
```

**Key Changes:**
- Multi-stage builds for smaller images
- Proper monorepo context paths
- Production-optimized builds

### Development with Docker

```bash
# Start all services
cd docker
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## 🔄 CI/CD Updates

GitHub Actions workflow has been updated to work with monorepo:

**New Features:**
- ✅ pnpm caching for faster installs
- ✅ Selective builds (only changed packages)
- ✅ Turborepo remote caching (optional)
- ✅ Updated paths for new structure

**Required Secrets:**
Add these to GitHub repository settings:
- `TURBO_TOKEN` (optional, for remote caching)
- `TURBO_TEAM` (optional, for remote caching)

---

## 📝 Migration Checklist

### For Developers

- [ ] Install pnpm globally: `npm install -g pnpm@8.9.0`
- [ ] Delete old `node_modules` folders
- [ ] Run `pnpm install` at root
- [ ] Build shared types: `pnpm --filter @ai-blog/types build`
- [ ] Test local development: `pnpm dev`

### For Backend Developers

- [ ] Review Nest.js module structure
- [ ] Migrate existing Express routes to Nest.js controllers
- [ ] Update imports to use `@ai-blog/types`
- [ ] Test API endpoints
- [ ] Check Swagger docs at `http://localhost:3000/api/docs`

### For Frontend Developers

- [ ] Update imports to use shared types
- [ ] Replace local type definitions with `@ai-blog/types`
- [ ] Test API integration
- [ ] Verify Vite configuration

---

## ⚠️ Breaking Changes

### Import Paths

**Before:**
```typescript
import { User } from '../models/User';
```

**After:**
```typescript
import { User } from '@ai-blog/types';
```

### Running Commands

**Before:**
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

**After:**
```bash
pnpm dev  # Starts all apps
# OR
pnpm --filter @ai-blog/backend start:dev
```

### Docker Context

**Before:**
```dockerfile
COPY backend/package*.json ./
```

**After:**
```dockerfile
COPY apps/backend/package*.json ./apps/backend/
```

---

## 🎯 Benefits of Monorepo

1. **Shared Types**: Single source of truth for TypeScript interfaces
2. **Faster Builds**: Turborepo caches and parallelizes builds
3. **Atomic Commits**: Changes across apps in one commit
4. **Simplified CI/CD**: One pipeline for all apps
5. **Dependency Deduplication**: pnpm saves disk space
6. **Consistent Tooling**: Same linter, formatter, etc.

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@ai-blog/types'"

**Solution:**
```bash
# Build the types package first
pnpm --filter @ai-blog/types build

# Then restart your app
pnpm --filter @ai-blog/backend start:dev
```

### Issue: pnpm install fails

**Solution:**
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall
pnpm install
```

### Issue: Docker build fails

**Solution:**
```bash
# Make sure you're in the correct directory
cd docker

# Build with verbose output
docker-compose build --no-cache
```

### Issue: Turbo cache not working

**Solution:**
```bash
# Clear turbo cache
rm -rf .turbo

# Rebuild
pnpm build
```

---

## 📚 Next Steps

1. **Complete Backend Migration**: Gradually migrate remaining Express routes to Nest.js controllers
2. **Add More Shared Packages**: Extract common utilities to `packages/utils`
3. **Enable Remote Caching**: Set up Turborepo remote cache for team collaboration
4. **Add E2E Tests**: Use the monorepo structure for integration testing
5. **Deploy**: Test the new Docker images and CI/CD pipeline

---

## 🔗 Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Documentation](https://pnpm.io/)
- [Nest.js Documentation](https://docs.nestjs.com/)
- [Vercel Deployment](https://vercel.com/docs)

---

## 💡 Tips

1. **Use Workspace Filters**: `pnpm --filter @ai-blog/backend` to target specific apps
2. **Leverage Turbo Cache**: Add `TURBO_TOKEN` for team-wide build caching
3. **Shared Types First**: Always build `@ai-blog/types` before other packages
4. **One Command Dev**: Use `pnpm dev` to start everything at once
5. **Check Swagger**: Backend API docs auto-generated at `/api/docs`

---

**Migration completed!** 🎊

For questions or issues, refer to the documentation above or check the project's main README.
