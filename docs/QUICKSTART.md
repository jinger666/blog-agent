# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Docker and Docker Compose installed
- ✅ OpenAI API key

## Step-by-Step Setup

### Option 1: Docker Compose (Easiest)

1. **Navigate to project root**
   ```bash
   cd e:\app-ai
   ```

2. **Set up environment variables**
   ```bash
   # Copy example env file
   copy backend\.env.example backend\.env
   
   # Edit backend\.env and add your OpenAI API key
   notepad backend\.env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running**
   ```bash
   docker-compose ps
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

6. **View logs**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

### Option 2: Manual Setup

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   copy .env.example .env
   # Edit .env with your settings
   ```

3. **Start MongoDB and Redis**
   ```bash
   # Use Docker for databases only
   docker-compose up -d mongodb redis
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access application**
   - Open http://localhost:5173 in your browser

## First Time Usage

### 1. Login
- Email: `admin@example.com`
- Password: `password`

*(Note: Authentication is not fully implemented yet, this is a placeholder)*

### 2. Try AI Chat
1. Navigate to "AI Chat" in the sidebar
2. Type a message and press Enter
3. The agent will respond (currently returns placeholder response)

### 3. Explore Features
- **Dashboard**: View platform statistics
- **Workflows**: Visual workflow editor (placeholder)
- **Memories**: Memory management interface (placeholder)

## Common Commands

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Remove volumes (caution: deletes data)
docker-compose down -v
```

### Backend
```bash
npm run dev        # Development mode
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Check code style
npm run test       # Run tests
```

### Frontend
```bash
npm run dev        # Development mode
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Check code style
```

## Troubleshooting

### Port Already in Use

If ports 3000, 5173, 27017, or 6379 are in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### MongoDB Connection Error

```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# View MongoDB logs
docker-compose logs mongodb
```

### Redis Connection Error

```bash
# Check if Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

### Backend Won't Start

1. Check environment variables in `backend/.env`
2. Ensure MongoDB and Redis are running
3. Check logs: `docker-compose logs backend`

### Frontend Won't Load

1. Ensure backend is running
2. Check browser console for errors
3. Verify `VITE_API_URL` in `frontend/.env`

## Next Steps

After getting the basic setup working:

1. **Implement Agent Core**: Add LangChain agent logic
2. **Build Memory System**: Implement short-term and long-term memory
3. **Add RAG Pipeline**: Document indexing and retrieval
4. **Create MCP Tools**: Text, image, document processing tools
5. **Develop Workflow Editor**: React Flow integration
6. **Build Browser Extension**: Chrome/Edge extension

## Getting Help

- Check `specs/SPEC.md` for detailed requirements
- Review `specs/tasks.md` for implementation tasks
- See `specs/checklist.md` for verification criteria

## Development Tips

- Use TypeScript strict mode for better type safety
- Follow the existing code structure and naming conventions
- Write tests for new features
- Keep commits small and focused
- Update documentation as you develop

---

Happy coding! 🚀
