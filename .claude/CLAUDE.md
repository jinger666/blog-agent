# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Monorepo (from root)
pnpm install                        # Install all dependencies
pnpm run dev                        # Run all apps in dev mode (Turborepo)
pnpm run build                      # Build all apps
pnpm run test                       # Run all tests
pnpm run lint                       # Lint all apps
pnpm run clean                      # Clean all builds

# Backend (Nest.js, port 3000)
pnpm --filter @ai-blog/backend run start:dev     # Dev with hot reload
pnpm --filter @ai-blog/backend run build         # Production build
pnpm --filter @ai-blog/backend run lint          # ESLint
pnpm --filter @ai-blog/backend run test          # Run Jest tests
pnpm --filter @ai-blog/backend run test:cov      # Jest with coverage
pnpm --filter @ai-blog/backend run test:e2e      # E2E tests
pnpm --filter @ai-blog/backend run test -- auth.service.spec.ts  # Single test file

# Frontend (React + Vite, port 5173)
pnpm --filter @ai-blog/frontend run dev          # Vite dev server
pnpm --filter @ai-blog/frontend run build        # TypeScript check + Vite build
pnpm --filter @ai-blog/frontend run lint         # ESLint

# Extension (WXT, Manifest V3)
pnpm run dev:extension                           # Extension dev mode

# Docker
docker-compose up -d                             # Start MongoDB, Redis, backend, frontend
```

## Architecture

### Backend: Dual-Layer Design

The backend has two distinct layers with different patterns:

**1. Agent Core (`src/agent/`)** — plain TypeScript, no NestJS dependency injection. All classes are module-level singletons exported as pre-instantiated constants:
- `getAgent()` / `resetAgent()` — BlogAgent singleton (LangChain ReAct agent)
- `shortTermMemory` — session-based chat history in MongoDB with sliding window
- `longTermMemory` — persistent memory with embedding vectors, categories, and importance scoring
- `ragSystem` — document chunking, indexing, and text-based retrieval
- `toolRegistry` — LangChain tool registry for agent skills
- `llmFactory` / `getDefaultLLM()` — LLM provider factory (OpenAI/Anthropic/DeepSeek)

These singletons use **raw Mongoose** (`new mongoose.Schema()`, `mongoose.model()`) directly — not NestJS's `@nestjs/mongoose`.

**2. NestJS Modules (`src/modules/`)** — HTTP API layer. Each module has a controller, service, and (sometimes) Mongoose schemas with decorators. NestJS services call the agent-layer singletons. Auth uses `@nestjs/jwt` + `@nestjs/passport`.

Key NestJS globals configured in `main.ts`: `ValidationPipe` (whitelist+transform), `AllExceptionsFilter`, `RateLimitInterceptor` (100 req/min per IP), CORS, Helmet, compression, Swagger at `/api/docs`.

**Important**: When adding features, the split is: business logic in `src/agent/`, HTTP exposure in `src/modules/`. The NestJS layer is thin — it delegates to singletons.

### Frontend

React 18 SPA with React Router v6. Two Zustand stores:
- `authStore` — uses `zustand/middleware/persist` for localStorage-backed auth
- `chatStore` — plain Zustand for chat messages and sessions

API client (`src/api/client.ts`) uses axios with interceptors: request interceptor injects Bearer token from authStore, response interceptor redirects to `/login` on 401.

Routes: `/login` (public), `/` (Dashboard), `/chat`, `/workflows` (WorkflowRoute with hidden header), `/memories`.

### Shared Types

`packages/types/` (`@ai-blog/types`) — shared TypeScript interfaces for API responses, workflows, chat messages, memory, and RAG. Used via `workspace:*` dependency by both frontend and backend.

### Browser Extension

WXT (Manifest V3) extension targeting CSDN blog enhancement with side panel support.

## Key Patterns

- **Environment**: Copy `.env.example` to `.env` in both `apps/backend/` and `apps/frontend/`. Backend requires `OPENAI_API_KEY` and `JWT_SECRET`.
- **Two Mongoose usage styles coexist**: NestJS modules use decorator-based `@Schema()` / `SchemaFactory`; agent code uses raw `new mongoose.Schema()` and `mongoose.model()`. Don't mix them within a single file.
- **Embeddings are placeholder**: The `generateEmbedding()` methods in `longTermMemory.ts` and `ragSystem.ts` use simple hash-based vectors. Production use would call OpenAI embeddings API.
- **No tests exist yet** despite Jest being configured. Test infrastructure is ready but implementation is pending.
