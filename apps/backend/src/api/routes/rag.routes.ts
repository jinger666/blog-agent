import { Router } from 'express';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import { ragSystem } from '../../agent/rag/ragSystem';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/rag/index - Index new documents
router.post('/index', asyncHandler(async (req, res) => {
  const { content, metadata, type } = req.body;
  
  if (!content) {
    throw new AppError('Document content is required', 400);
  }

  const documentId = uuidv4();
  const chunkCount = await ragSystem.indexDocument({
    id: documentId,
    content,
    metadata,
    type,
  });

  res.json({ 
    message: 'Document indexed successfully',
    documentId,
    chunkCount,
  });
}));

// POST /api/rag/query - Query with context
router.post('/query', asyncHandler(async (req, res) => {
  const { query, topK = 5 } = req.body;
  
  if (!query) {
    throw new AppError('Query text is required', 400);
  }

  const result = await ragSystem.query(query, { topK });

  res.json(result);
}));

// DELETE /api/rag/documents/:id - Remove document
router.delete('/documents/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const deletedCount = await ragSystem.removeDocument(id);

  res.json({ 
    message: 'Document removed successfully',
    deletedCount,
  });
}));

// GET /api/rag/stats - Index statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await ragSystem.getStats();
  res.json(stats);
}));

export default router;
