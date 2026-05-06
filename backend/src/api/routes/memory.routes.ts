import { Router } from 'express';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import { longTermMemory } from '../../agent/memory/longTermMemory';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/memory/search - Search memories
router.get('/search', asyncHandler(async (req, res) => {
  const { q, limit, category, userId = 'anonymous' } = req.query;
  
  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  const results = await longTermMemory.searchMemories(
    userId as string,
    q as string,
    {
      limit: limit ? parseInt(limit as string) : 10,
      category: category as string,
    }
  );

  res.json({ 
    memories: results.map(r => ({
      id: r.memory.id,
      content: r.memory.content,
      category: r.memory.category,
      importance: r.memory.importance,
      similarity: r.similarity,
      createdAt: r.memory.createdAt,
    })),
    count: results.length,
  });
}));

// POST /api/memory/store - Store new memory
router.post('/store', asyncHandler(async (req, res) => {
  const { content, category, userId = 'anonymous', metadata } = req.body;
  
  if (!content || !category) {
    throw new AppError('Content and category are required', 400);
  }

  if (!['fact', 'preference', 'history'].includes(category)) {
    throw new AppError('Invalid category. Must be: fact, preference, or history', 400);
  }

  const memory = await longTermMemory.storeMemory({
    id: uuidv4(),
    userId,
    content,
    category: category as 'fact' | 'preference' | 'history',
    metadata,
  });

  res.json({ 
    memory: {
      id: memory.id,
      content: memory.content,
      category: memory.category,
      importance: memory.importance,
    },
    message: 'Memory stored successfully',
  });
}));

// PUT /api/memory/:id - Update memory
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const memory = await longTermMemory.updateMemory(id, updates);

  res.json({ 
    memory: {
      id: memory.id,
      content: memory.content,
      category: memory.category,
      importance: memory.importance,
    },
    message: 'Memory updated successfully',
  });
}));

// DELETE /api/memory/:id - Delete memory
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await longTermMemory.deleteMemory(id);

  res.json({ 
    message: 'Memory deleted successfully',
  });
}));

// GET /api/memory/stats - Memory statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const { userId = 'anonymous' } = req.query;
  
  const stats = await longTermMemory.getMemoryStats(userId as string);

  res.json(stats);
}));

export default router;
