# AI Blog Platform

A full-stack AI-powered content creation platform integrating LangChain-based Agent services with visual orchestration, supporting multi-modal input (text, images, documents) and intelligent output generation (titles, summaries, mind maps).

## 🚀 Features

- **AI Agent Core**: LangChain-based agent with ReAct reasoning loop
- **Multi-modal Chat**: Support for text, image, and document inputs
- **Memory Management**: Short-term and long-term memory with semantic search
- **Agentic RAG**: Document indexing and retrieval with context-augmented generation
- **Visual Workflow Editor**: Drag-and-drop workflow orchestration with React Flow
- **Browser Extension**: Chrome/Edge extension for CSDN enhancement
- **CLI Tools**: Command-line interface for agent and memory management

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js 18+ / TypeScript 5.x
- **Framework**: Express.js
- **Agent Framework**: LangChain.js
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis
- **Task Queue**: Bull

### Frontend
- **Framework**: React 18 + TypeScript
- **UI Library**: Ant Design 5.x
- **State Management**: Zustand
- **Build Tool**: Vite 5.x
- **Flow Editor**: React Flow

### Browser Extension
- **Framework**: WXT (Manifest V3)

## 🏗️ Project Structure

```
AI-app/
├── backend/                 # Backend API service
│   ├── src/
│   │   ├── agent/          # Agent core implementation
│   │   ├── api/            # REST API routes
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── tools/          # MCP tools
│   │   └── utils/          # Utility functions
│   └── package.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── stores/        # Zustand stores
│   └── package.json
├── extension/             # Browser extension (TODO)
├── docker/                # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── specs/                 # Project specifications
```

## 🛠️ Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)
- OpenAI API key

## 🚦 Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd AI-app
```

### 2. Environment Setup

Copy environment variable templates:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Using Docker Compose (Recommended)

Start all services:

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- Backend API on port 3000
- Frontend on port 5173

### 4. Manual Setup (Alternative)

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Key Endpoints

#### Agent
- `POST /api/agent/chat` - Chat with AI agent
- `POST /api/agent/execute` - Execute a skill/tool
- `GET /api/agent/sessions` - List sessions

#### Memory
- `GET /api/memory/search?q=keyword` - Search memories
- `POST /api/memory/store` - Store new memory
- `DELETE /api/memory/:id` - Delete memory

#### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `POST /api/workflows/:id/execute` - Execute workflow

#### RAG
- `POST /api/rag/index` - Index documents
- `POST /api/rag/query` - Query with context

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run test       # Run tests
```

### Frontend Development

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
```

## 🧪 Testing

```bash
cd backend
npm run test           # Run tests
npm run test:coverage  # Run with coverage
```

## 📝 Implementation Status

### ✅ Completed
- [x] Project structure and configuration
- [x] Backend Express server setup
- [x] Database connections (MongoDB + Redis)
- [x] API route structure
- [x] Frontend React app with routing
- [x] Authentication UI
- [x] State management setup
- [x] Docker Compose configuration

### 🚧 In Progress
- [ ] Agent core implementation with LangChain
- [ ] Memory management system
- [ ] RAG pipeline
- [ ] MCP tools development
- [ ] Visual workflow editor
- [ ] Browser extension

### 📅 Planned
- [ ] CLI tools
- [ ] Advanced skills framework
- [ ] Task scheduling
- [ ] Production deployment
- [ ] Comprehensive testing

## 🔐 Security

- JWT authentication for API endpoints
- Rate limiting (100 requests/minute)
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

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

- LangChain for the agent framework
- OpenAI for GPT models
- Ant Design for UI components
- React Flow for workflow visualization

---

**Note**: This is an initial project setup. Many features are marked as TODO and need implementation. Refer to the `specs/` directory for detailed requirements and task breakdown.
