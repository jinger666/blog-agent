# AI Blog Platform

A full-stack AI-powered content creation platform integrating LangChain-based Agent services with visual orchestration, supporting multi-modal input (text, images, documents) and intelligent output generation (titles, summaries, mind maps).

## 🚀 Features

- **AI Agent Core**: LangChain-based agent with ReAct reasoning loop
- **Multi-modal Chat**: Support for text, image, and document inputs
- **Memory Management**: Short-term and long-term memory with semantic search
- **Agentic RAG**: Document indexing and retrieval with context-augmented generation
- **Visual Workflow Editor**: Drag-and-drop workflow orchestration with React Flow
- **Browser Extension**: Chrome/Edge extension for CSDN enhancement
- **Dify Integration**: Seamless integration with Dify workflow platform

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js 18+ / TypeScript 5.x
- **Framework**: Nest.js (Pure Nest.js architecture)
- **Agent Framework**: LangChain.js
- **Database**: MongoDB (Mongoose ODM with Nest.js modules)
- **Cache**: Redis (Nest.js service)
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 + TypeScript
- **UI Library**: Ant Design 5.x
- **State Management**: Zustand
- **Build Tool**: Vite 5.x
- **Flow Editor**: React Flow

### Browser Extension
- **Framework**: WXT (Manifest V3)

### DevOps
- **Monorepo**: Turborepo + pnpm workspaces
- **CI/CD**: GitHub Actions + Vercel
- **Containerization**: Docker & Docker Compose

## 🏗️ Project Structure

```
ai-blog-monorepo/
├── apps/                          # Applications
│   ├── backend/                   # Nest.js backend API
│   │   ├── src/
│   │   │   ├── agent/            # Core AI logic (LangChain)
│   │   │   │   ├── core/         # BlogAgent, LLM provider, tools
│   │   │   │   ├── memory/       # Short-term & long-term memory
│   │   │   │   ├── rag/          # RAG system & document processor
│   │   │   │   ├── workflow/     # Workflow engine
│   │   │   │   └── skills/       # Blog-specific skills
│   │   │   ├── modules/          # Nest.js feature modules
│   │   │   │   ├── auth/         # Authentication module
│   │   │   │   ├── agent/        # Agent API endpoints
│   │   │   │   ├── memory/       # Memory management
│   │   │   │   ├── workflow/     # Workflow orchestration
│   │   │   │   ├── rag/          # RAG operations
│   │   │   │   ├── database/     # MongoDB connection
│   │   │   │   └── redis/        # Redis connection
│   │   │   ├── guards/           # JWT authentication guard
│   │   │   ├── filters/          # Exception filters
│   │   │   ├── interceptors/     # Rate limiting interceptor
│   │   │   ├── services/         # External services (Dify)
│   │   │   ├── tools/            # Text & document tools
│   │   │   ├── utils/            # Logger utility
│   │   │   ├── app.module.ts     # Root module
│   │   │   └── main.ts           # Application entry point
│   │   └── package.json
│   ├── frontend/                  # React frontend application
│   │   ├── src/
│   │   │   ├── api/              # API client
│   │   │   ├── components/       # React components
│   │   │   ├── pages/            # Page components
│   │   │   └── stores/           # Zustand stores
│   │   └── package.json
│   └── extension/                 # Browser extension
├── packages/                      # Shared packages
│   └── types/                     # Shared TypeScript types
├── docker/                        # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── .github/workflows/             # CI/CD pipelines
├── turbo.json                     # Turborepo configuration
└── pnpm-workspace.yaml            # pnpm workspace definition
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm 8.9+ (package manager)
- Docker and Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)
- OpenAI API key

### 1. Clone Repository

```bash
git clone <repository-url>
cd ai-blog-monorepo
```

### 2. Environment Setup

Copy environment variable templates:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

Edit `apps/backend/.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Using Docker Compose (Recommended)

Start all services:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- Backend API on port 3000
- Frontend on port 5173

### 5. Manual Setup (Alternative)

#### Backend

```bash
cd apps/backend
pnpm install
pnpm run start:dev    # Development mode with hot reload
```

#### Frontend

```bash
cd apps/frontend
pnpm install
pnpm run dev          # Development server
```

### 6. Monorepo Commands

```bash
# Run backend and frontend in development mode
pnpm run dev

# Run extension only (separately)
pnpm run dev:extension

# Build all apps
pnpm run build

# Run tests across all apps
pnpm run test

# Clean all builds
pnpm run clean
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Swagger Documentation
When running in development mode, access interactive API docs at:
```
http://localhost:3000/api/docs
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

#### Agent
- `POST /api/agent/chat` - Chat with AI agent
- `POST /api/agent/execute` - Execute a skill/tool
- `GET /api/agent/sessions` - List chat sessions
- `GET /api/agent/sessions/:id` - Get session history

#### Memory
- `GET /api/memory/search?q=keyword` - Search memories
- `POST /api/memory/store` - Store new memory
- `PUT /api/memory/:id` - Update memory
- `DELETE /api/memory/:id` - Delete memory
- `GET /api/memory/stats` - Memory statistics

#### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Execute workflow
- `GET /api/workflows/:id/executions` - Execution history

#### Dify Integration
- `POST /api/workflows/dify/execute` - Execute Dify workflow
- `GET /api/workflows/dify/status/:taskId` - Get workflow status
- `POST /api/workflows/dify/stop/:taskId` - Stop workflow
- `GET /api/workflows/dify/info` - Get Dify app info
- `GET /api/workflows/dify/health` - Check Dify health

#### RAG
- `POST /api/rag/index` - Index documents
- `POST /api/rag/query` - Query with context
- `DELETE /api/rag/documents/:id` - Remove document
- `GET /api/rag/stats` - Index statistics

### Health Check
```
GET /health
```

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- **[Quick Start](./docs/QUICKSTART.md)** - Get started quickly
- **[Development Guide](./docs/DEVELOPMENT_GUIDE.md)** - Complete development guide
- **[Dify Integration](./docs/DIFY_INTEGRATION.md)** - Dify platform integration
- **[Vercel Setup](./docs/VERCEL_SETUP.md)** - Deployment guide
- **[Monorepo Migration](./docs/MONOREPO_MIGRATION.md)** - Architecture details
- **[Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md)** - Implementation status

See [docs/README.md](./docs/README.md) for complete documentation index.

## 🔧 Development

### Backend Development

```bash
cd apps/backend
pnpm run start:dev      # Development with hot reload
pnpm run build          # Build for production
pnpm run start:prod     # Start production build
pnpm run lint           # Run ESLint
pnpm run test           # Run tests
```

### Frontend Development

```bash
cd apps/frontend
pnpm run dev            # Development server
pnpm run build          # Build for production
pnpm run lint           # Run ESLint
```

### Monorepo Development

```bash
# Run all apps simultaneously
pnpm run dev

# Build specific app
pnpm --filter @ai-blog/backend build
pnpm --filter @ai-blog/frontend build

# Test specific app
pnpm --filter @ai-blog/backend test
```

## 🧪 Testing

```bash
# Run all tests
cd apps/backend
pnpm run test

# Run with coverage
pnpm run test:coverage

# Run specific test file
pnpm run test -- auth.service.spec.ts
```

## 📝 Implementation Status

### ✅ Completed
- [x] Monorepo structure with Turborepo + pnpm
- [x] Pure Nest.js backend architecture
- [x] Database connections (MongoDB + Redis) via Nest.js modules
- [x] Authentication module with JWT
- [x] Agent module with LangChain integration
- [x] Memory management system (short-term & long-term)
- [x] RAG pipeline with document indexing
- [x] Workflow orchestration engine
- [x] Dify integration
- [x] API documentation with Swagger
- [x] Frontend React app with routing
- [x] State management setup
- [x] Docker Compose configuration
- [x] CI/CD pipeline with GitHub Actions + Vercel

### 🚧 In Progress
- [ ] Advanced skills framework
- [ ] Browser extension completion
- [ ] Comprehensive unit tests
- [ ] Performance optimization

### 📅 Planned
- [ ] Task scheduling with Bull
- [ ] WebSocket real-time updates
- [ ] Advanced monitoring and analytics
- [ ] Multi-language support

## 🔐 Security

- JWT authentication with Nest.js guards
- Rate limiting (100 requests/minute) via interceptors
- Input validation with class-validator DTOs
- CORS configuration
- Helmet.js security headers
- Global exception filtering
- Password hashing with bcrypt

## 📊 Monitoring

- Winston logging with file rotation
- Health check endpoint at `/health`
- Error tracking and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License

## 👥 Authors

AI Blog Platform Development Team

## 🙏 Acknowledgments

- **Nest.js** for the modern backend framework
- **LangChain** for the agent framework
- **OpenAI** for GPT models
- **Ant Design** for UI components
- **React Flow** for workflow visualization
- **Turborepo** for monorepo build system
- **Vercel** for frontend hosting

---

**Architecture Note**: This project uses a pure Nest.js backend with modular architecture. The `src/agent/` directory contains core AI logic (LangChain agents, memory systems, RAG, workflows) that is integrated into Nest.js modules for HTTP API exposure. This hybrid approach maintains clean separation between business logic and API layer while leveraging Nest.js benefits like dependency injection, validation, and error handling.
