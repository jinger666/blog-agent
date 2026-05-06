# Development Guide

## Project Architecture

This project follows a monorepo structure with separate backend and frontend applications.

## Backend Development

### Directory Structure

```
backend/src/
├── agent/           # LangChain agent implementation
│   ├── core/       # Agent core logic
│   ├── memory/     # Memory management
│   ├── rag/        # RAG pipeline
│   └── skills/     # Agent skills
├── api/            # REST API
│   ├── routes/     # Route definitions
│   ├── controllers/# Request handlers
│   └── middleware/ # Express middleware
├── config/         # Configuration modules
├── models/         # Mongoose schemas
├── tools/          # MCP tools
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

### Adding a New API Endpoint

1. **Create route handler** in `backend/src/api/routes/`:

```typescript
import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.post('/endpoint', asyncHandler(async (req, res) => {
  // Your logic here
  res.json({ message: 'Success' });
}));

export default router;
```

2. **Register route** in `backend/src/index.ts`:

```typescript
import newRoutes from './api/routes/new.routes';
app.use('/api/new', newRoutes);
```

3. **Add validation** using express-validator:

```typescript
import { body, validationResult } from 'express-validator';

router.post('/endpoint',
  [
    body('field').isString().notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  })
);
```

### Creating a Mongoose Model

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IYourModel extends Document {
  field: string;
  createdAt: Date;
}

const YourModelSchema = new Schema<IYourModel>({
  field: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export default mongoose.model<IYourModel>('YourModel', YourModelSchema);
```

### Implementing an MCP Tool

```typescript
import { Tool } from '@langchain/core/tools';

export class YourTool extends Tool {
  name = 'your_tool';
  description = 'Description of what this tool does';

  async _call(input: string): Promise<string> {
    try {
      // Tool logic here
      return JSON.stringify({ result: 'success' });
    } catch (error) {
      return JSON.stringify({ error: error.message });
    }
  }
}
```

### Writing Tests

```typescript
import request from 'supertest';
import app from '../index';

describe('API Endpoint', () => {
  it('should return success', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ field: 'value' })
      .expect(200);
    
    expect(response.body).toHaveProperty('message');
  });
});
```

## Frontend Development

### Directory Structure

```
frontend/src/
├── api/            # API clients
├── components/     # Reusable components
│   ├── layout/    # Layout components
│   └── common/    # Shared components
├── pages/         # Page components
├── stores/        # Zustand stores
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── App.tsx        # Main app component
└── main.tsx       # Entry point
```

### Creating a New Page

1. **Create page component** in `frontend/src/pages/`:

```tsx
import React from 'react';
import { Card } from 'antd';

const YourPage: React.FC = () => {
  return (
    <div>
      <h1>Your Page</h1>
      <Card>Content here</Card>
    </div>
  );
};

export default YourPage;
```

2. **Add route** in `frontend/src/App.tsx`:

```tsx
import YourPage from './pages/YourPage';

<Route
  path="/your-page"
  element={
    <PrivateRoute>
      <YourPage />
    </PrivateRoute>
  }
/>
```

3. **Add menu item** in `MainLayout.tsx`:

```tsx
{
  key: '/your-page',
  icon: <YourIcon />,
  label: 'Your Page',
}
```

### Creating a Zustand Store

```typescript
import { create } from 'zustand';

interface YourState {
  value: string;
  setValue: (value: string) => void;
}

export const useYourStore = create<YourState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

### Making API Calls

```typescript
import apiClient from '../api/client';

const fetchData = async () => {
  try {
    const response = await apiClient.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
```

### Creating a Reusable Component

```tsx
import React from 'react';
import { Button } from 'antd';

interface YourComponentProps {
  title: string;
  onClick?: () => void;
}

const YourComponent: React.FC<YourComponentProps> = ({ 
  title, 
  onClick 
}) => {
  return (
    <Button onClick={onClick}>
      {title}
    </Button>
  );
};

export default YourComponent;
```

## Common Patterns

### Error Handling

**Backend:**
```typescript
import { AppError } from '../middleware/errorHandler';

throw new AppError('Resource not found', 404);
```

**Frontend:**
```typescript
try {
  await apiCall();
} catch (error: any) {
  message.error(error.response?.data?.error?.message || 'Error occurred');
}
```

### Authentication

**Backend middleware:**
```typescript
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AppError('Authentication required', 401);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Invalid token', 401);
  }
};
```

### State Management

**With persistence:**
```typescript
import { persist } from 'zustand/middleware';

export const useStore = create<State>()(
  persist(
    (set) => ({
      // state
    }),
    {
      name: 'storage-key',
    }
  )
);
```

## Best Practices

### TypeScript

1. **Use interfaces for object shapes**
2. **Avoid `any` type** - use proper typing
3. **Use type guards** for runtime checks
4. **Enable strict mode** in tsconfig

### React

1. **Use functional components** with hooks
2. **Memoize expensive calculations** with `useMemo`
3. **Extract reusable logic** into custom hooks
4. **Use React.lazy** for code splitting

### Backend

1. **Validate all inputs** before processing
2. **Use async/await** consistently
3. **Handle errors gracefully**
4. **Log important events**
5. **Rate limit public endpoints**

### Database

1. **Index frequently queried fields**
2. **Use transactions** for critical operations
3. **Validate data at schema level**
4. **Implement soft deletes** when needed

## Debugging

### Backend

```bash
# View logs
docker-compose logs -f backend

# Attach to container
docker exec -it ai-blog-backend sh

# Debug with Node.js inspector
NODE_OPTIONS='--inspect' npm run dev
```

### Frontend

```bash
# View logs
docker-compose logs -f frontend

# Open browser DevTools
# Check Console and Network tabs
```

### Database

```bash
# Connect to MongoDB
docker exec -it ai-blog-mongodb mongosh -u admin -p password123

# Connect to Redis
docker exec -it ai-blog-redis redis-cli -a redis_password123
```

## Code Quality

### ESLint

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Prettier

```bash
# Format code
npm run format
```

### Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Performance Tips

### Backend
- Use Redis caching for frequent queries
- Implement pagination for large datasets
- Use connection pooling for databases
- Compress responses with compression middleware

### Frontend
- Lazy load routes with React.lazy
- Memoize components with React.memo
- Use virtual scrolling for long lists
- Optimize images and assets

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Build frontend for production
- [ ] Run database migrations
- [ ] Test health check endpoint
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts

## Useful Commands

```bash
# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f            # View logs
docker-compose restart            # Restart services
docker-compose build --no-cache   # Rebuild without cache

# Backend
npm run dev                       # Development server
npm run build                     # Production build
npm run start                     # Start production server
npm run test                      # Run tests

# Frontend
npm run dev                       # Development server
npm run build                     # Production build
npm run preview                   # Preview build
```

## Resources

- [LangChain.js Docs](https://js.langchain.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Ant Design Components](https://ant.design/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Redis Documentation](https://redis.io/documentation)

---

Happy coding! 🚀
