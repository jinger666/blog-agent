# AI Blog Platform - Project Specification

## 1. Project Overview

**Project Name:** AI Blog Platform (AI博客平台)
**Project Type:** Full-stack AI-powered content creation platform
**Core Feature Summary:** A multimodal blog creation platform integrating LangChain-based Agent services with visual orchestration, supporting text/image/document input and intelligent output generation (titles, summaries, mind maps).
**Target Users:** Blog writers, content creators, technical bloggers, especially users publishing on CSDN and similar platforms

## 2. Technology Stack

### Backend
- **Runtime:** Node.js 18+ / TypeScript 5.x
- **Framework:** Express.js 4.x or Fastify 3.x
- **Agent Framework:** LangChain.js (Node.js version)
- **Database:** MongoDB (document storage), Redis (cache/session)
- **Vector Store:** Pinecone / Milvus / Qdrant (for RAG)
- **Message Queue:** Bull (for task scheduling)

### Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** Ant Design 5.x / Material UI 5.x
- **State Management:** Zustand / Redux Toolkit
- **Flow Editor:** React Flow (for visual orchestration)
- **Build Tool:** Vite 5.x

### Browser Extension
- **Framework:** WXT (modern cross-browser extension framework)
- **Manifest:** Manifest V3

### DevOps & Tools
- **Container:** Docker + Docker Compose
- **API Documentation:** OpenAPI 3.0 / Swagger
- **Testing:** Jest + Supertest

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Multi-modal │  │  Visual     │  │    Task Monitor        │  │
│  │ Chat Dialog │  │ Orchestrator│  │    Dashboard            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + LangChain.js)            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Agent Core │  │   Memory    │  │    MCP Tools            │  │
│  │  (Decision) │  │   System    │  │  (Text/Img/Doc)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Agentic    │  │    CLI     │  │    Dify-like            │  │
│  │  RAG        │  │  Interface  │  │    Orchestration        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              External Services & Storage                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  MongoDB    │  │   Redis     │  │    Vector Store         │  │
│  │  (Docs)     │  │  (Cache)    │  │    (Pinecone/etc)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Functionality Specification

### 4.1 Agent Core Service

#### 4.1.1 Agent Architecture
- **Decision Engine:** Powered by LLM (OpenAI GPT-4 / Claude 3 / Local LLM)
- **Reasoning Loop:** ReAct (Reasoning + Action) pattern implementation
- **Tool Router:** Dynamic tool selection based on task type

#### 4.1.2 Agent Capabilities
- Autonomous task decomposition and execution
- Multi-step reasoning with intermediate steps
- Error recovery and retry mechanisms
- Context window management for long conversations

### 4.2 Memory Management System

#### 4.2.1 Short-term Memory
- Conversation history within current session
- Sliding window approach (last N messages)
- Automatic summarization when context exceeds threshold

#### 4.2.2 Long-term Memory
- Persistent storage in MongoDB
- Semantic search via vector embeddings
- Memory importance scoring and pruning
- Memory categories: user preferences, learned facts, work history

#### 4.2.3 Memory Operations
- **Store:** Save new memories with timestamp and importance
- **Retrieve:** Semantic search with relevance scoring
- **Update:** Modify existing memories
- **Delete:** Remove outdated or irrelevant memories

### 4.3 Agentic RAG System

#### 4.3.1 Components
- **Document Processor:** Chunking, embedding generation
- **Retriever:** Hybrid search (dense + sparse)
- **Ranker:** Relevance scoring and re-ranking
- **Generator:** Context-augmented response generation

#### 4.3.2 RAG Features
- Memory-aware retrieval (use conversation context)
- Citation and source tracking
- Streaming responses with citations
- Configurable retrieval strategies

### 4.4 Custom MCP Tools

#### 4.4.1 Text Processing Tools
- `TextAnalyzer`: Analyze text structure, keywords, sentiment
- `TextSummarizer`: Generate concise summaries
- `TextTranslator`: Multi-language translation
- `MarkdownFormatter`: Format content as Markdown

#### 4.4.2 Image Processing Tools
- `ImageAnalyzer`: OCR, object detection, scene description
- `ImageCaptioner`: Generate descriptive captions
- `ImageUploader`: Upload and host images

#### 4.4.3 Document Processing Tools
- `PDFExtractor`: Extract text from PDF documents
- `DocxParser`: Parse Word documents
- `ExcelAnalyzer`: Analyze spreadsheet data

### 4.5 Agent Skills

#### 4.5.1 Core Skills
- `TitleGenerator`: Generate catchy blog titles
- `ContentOutliner`: Create content structure/outline
- `MindMapGenerator`: Generate mind maps from content
- `SEOOptimizer`: Suggest SEO improvements

#### 4.5.2 Extended Skills
- `CSDNFormatter`: Format content specifically for CSDN
- `CodeHighlighter`: Syntax highlighting for code blocks
- `GrammarChecker`: Check and correct grammar

### 4.6 CLI Management Tools

#### 4.6.1 Agent Management
```bash
# Start agent service
agent-cli start --port 3000

# Check agent status
agent-cli status

# View agent logs
agent-cli logs --tail 100
```

#### 4.6.2 Memory Management
```bash
# View memory stats
agent-cli memory stats

# Search memories
agent-cli memory search "keyword"

# Clear old memories
agent-cli memory cleanup --older-than 30d
```

#### 4.6.3 Configuration
```bash
# Update config
agent-cli config set openai.api_key=xxx

# View current config
agent-cli config show
```

### 4.7 Visual Orchestration Platform

#### 4.7.1 Workflow Designer
- Drag-and-drop node interface
- Node types: Agent, Tool, Condition, Loop, Output
- Connection management with data flow visualization
- Import/Export workflows as JSON

#### 4.7.2 Agent Nodes
- **Start Node:** Trigger point for workflow
- **LLM Node:** Call language model with prompt
- **Tool Node:** Execute specific tool
- **Condition Node:** Branch based on condition
- **Loop Node:** Iterate over collection
- **Memory Node:** Read/write from memory
- **End Node:** Terminate workflow

#### 4.7.3 Task Scheduling
- Cron-based scheduling for periodic tasks
- Manual trigger support
- Task queue with priority levels
- Real-time execution status

### 4.8 Browser Extension

#### 4.8.1 Core Features
- CSDN article reader with AI enhancement
- One-click content generation
- Side panel for AI assistant
- Content export to multiple formats

#### 4.8.2 CSDN-Specific Features
- Article structure analysis
- Code block extraction and highlighting
- Image alt text generation
- SEO suggestions

## 5. API Specification

### 5.1 Agent API

#### POST /api/agent/chat
Send message to agent and receive response.

**Request:**
```json
{
  "message": "Help me write a blog about AI",
  "sessionId": "uuid",
  "context": {
    "mode": "creative",
    "temperature": 0.7
  }
}
```

**Response:**
```json
{
  "response": "Sure, I'd be happy to help...",
  "sessionId": "uuid",
  "usedTools": ["TitleGenerator"],
  "memoryUpdated": true
}
```

#### POST /api/agent/execute
Execute a specific skill/tool.

**Request:**
```json
{
  "skill": "TitleGenerator",
  "input": {
    "topic": "Machine Learning Basics",
    "style": "professional"
  }
}
```

### 5.2 Memory API

#### GET /api/memory/search
Search long-term memories.

**Query:** `?q=python+tips&limit=10`

#### POST /api/memory/store
Store new memory.

#### DELETE /api/memory/:id
Delete specific memory.

### 5.3 Workflow API

#### GET /api/workflows
List all workflows.

#### POST /api/workflows
Create new workflow.

#### POST /api/workflows/:id/execute
Execute workflow.

## 6. Data Models

### 6.1 Session
```typescript
interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;
  context: Record<string, any>;
}
```

### 6.2 Memory
```typescript
interface Memory {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  category: 'fact' | 'preference' | 'history';
  importance: number;
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date;
}
```

### 6.3 Workflow
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 7. Security & Performance

### 7.1 Security
- API authentication via JWT
- Rate limiting (100 req/min per user)
- Input sanitization and validation
- Sensitive data encryption at rest
- CORS configuration for frontend

### 7.2 Performance
- Response streaming for long outputs
- Connection pooling for database
- Redis caching for frequent queries
- Background job processing for heavy tasks
- Lazy loading for large workflows

## 8. Error Handling

### 8.1 Error Types
- `AgentError`: Agent execution failures
- `MemoryError`: Memory operation failures
- `ToolError`: Tool execution failures
- `ValidationError`: Input validation failures

### 8.2 Error Response Format
```json
{
  "error": {
    "code": "TOOL_ERROR",
    "message": "Failed to process image",
    "details": {
      "tool": "ImageAnalyzer",
      "reason": "Unsupported format"
    }
  }
}
```

## 9. Acceptance Criteria

### 9.1 Core Functionality
- [ ] Agent can receive and respond to text messages
- [ ] Agent can use at least 3 different tools
- [ ] Short-term memory maintains conversation context
- [ ] Long-term memory persists across sessions
- [ ] RAG system retrieves relevant context for queries

### 9.2 Multimodal Support
- [ ] System accepts text input
- [ ] System accepts image input (JPG, PNG)
- [ ] System accepts document input (PDF, DOCX)
- [ ] System generates text, summaries, and mind maps

### 9.3 Visual Orchestration
- [ ] User can create workflow via drag-and-drop
- [ ] Workflows can be saved and loaded
- [ ] Workflow execution can be monitored
- [ ] Task scheduling works correctly

### 9.4 Browser Extension
- [ ] Extension installs on Chrome/Edge
- [ ] Extension connects to backend service
- [ ] CSDN pages are enhanced with AI features
- [ ] Content can be exported

### 9.5 CLI Tools
- [ ] CLI can start/stop agent service
- [ ] CLI can view and search memories
- [ ] CLI can manage configurations

### 9.6 Non-functional
- [ ] API response time < 3 seconds (simple queries)
- [ ] Error messages are user-friendly
- [ ] Logging captures all significant events
- [ ] Unit test coverage > 70%

## 10. Project Structure

```
AI-app/
├── backend/
│   ├── src/
│   │   ├── agent/           # Agent core implementation
│   │   │   ├── core/
│   │   │   ├── memory/
│   │   │   ├── rag/
│   │   │   └── skills/
│   │   ├── tools/           # MCP tools
│   │   ├── api/              # Express routes
│   │   ├── cli/              # CLI tools
│   │   ├── services/         # Business logic
│   │   ├── models/           # Data models
│   │   ├── config/           # Configuration
│   │   └── utils/            # Utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks
│   │   ├── stores/           # State management
│   │   ├── api/              # API clients
│   │   └── utils/            # Utilities
│   └── package.json
├── extension/
│   ├── src/
│   │   ├── background/
│   │   ├── content/
│   │   └── popup/
│   └── package.json
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile
├── specs/                    # This directory
│   ├── SPEC.md
│   ├── tasks.md
│   └── checklist.md
└── README.md
```
