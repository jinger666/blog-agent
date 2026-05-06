import { Router } from 'express';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import { getAgent } from '../../agent/core/blogAgent';
import { shortTermMemory } from '../../agent/memory/shortTermMemory';
import { longTermMemory } from '../../agent/memory/longTermMemory';
import { initializeDefaultTools } from '../../agent/core/toolRegistry';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Initialize default tools on startup
initializeDefaultTools();

// POST /api/agent/chat - Chat with agent
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, sessionId, context, userId = 'anonymous' } = req.body;

  if (!message) {
    throw new AppError('Message is required', 400);
  }

  const agent = getAgent();
  const currentSessionId = sessionId || uuidv4();

  // Get chat history from short-term memory
  const chatHistory = await shortTermMemory.getMessages(currentSessionId, 10);

  // Process with agent
  const result = await agent.chat(message, chatHistory, currentSessionId);

  // Store messages in short-term memory
  await shortTermMemory.addMessage(currentSessionId, {
    role: 'user',
    content: message,
    timestamp: new Date(),
  });

  await shortTermMemory.addMessage(currentSessionId, {
    role: 'assistant',
    content: result.response,
    timestamp: new Date(),
  });

  // Store important information in long-term memory
  if (result.usedTools.length > 0 || message.length > 50) {
    await longTermMemory.storeMemory({
      id: uuidv4(),
      userId,
      content: `${message} -> ${result.response.substring(0, 200)}`,
      category: 'history',
      metadata: {
        sessionId: currentSessionId,
        usedTools: result.usedTools,
      },
    });
  }

  res.json({
    response: result.response,
    sessionId: currentSessionId,
    usedTools: result.usedTools,
    memoryUpdated: true,
  });
}));

// POST /api/agent/execute - Execute a skill/tool
router.post('/execute', asyncHandler(async (req, res) => {
  const { skill, input, userId = 'anonymous' } = req.body;

  if (!skill) {
    throw new AppError('Skill name is required', 400);
  }

  const agent = getAgent();
  const result = await agent.executeSkill(skill, input);

  res.json({
    result,
    skill,
  });
}));

// GET /api/agent/sessions - List sessions
router.get('/sessions', asyncHandler(async (req, res) => {
  const { userId = 'anonymous', limit = 10 } = req.query;
  
  const sessions = await shortTermMemory.getUserSessions(
    userId as string,
    parseInt(limit as string)
  );

  res.json({ sessions });
}));

// GET /api/agent/sessions/:id - Get session history
router.get('/sessions/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit } = req.query;
  
  const messages = await shortTermMemory.getMessages(
    id,
    limit ? parseInt(limit as string) : undefined
  );

  res.json({ 
    sessionId: id,
    messages,
    count: messages.length,
  });
}));

export default router;
