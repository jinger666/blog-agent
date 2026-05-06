import { Router } from 'express';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import Workflow from '../../models/Workflow';
import { workflowEngine } from '../../agent/workflow/workflowEngine';
import { difyService } from '../../services/difyService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/workflows - List workflows
router.get('/', asyncHandler(async (req, res) => {
  const { userId = 'anonymous' } = req.query;
  
  const workflows = await Workflow.find({ userId })
    .sort({ createdAt: -1 })
    .select('-nodes -edges');

  res.json({ workflows });
}));

// POST /api/workflows - Create workflow
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, nodes, edges, userId = 'anonymous' } = req.body;
  
  if (!name || !nodes || !edges) {
    throw new AppError('Name, nodes, and edges are required', 400);
  }

  const workflow = await Workflow.create({
    id: uuidv4(),
    userId,
    name,
    description: description || '',
    nodes,
    edges,
  });

  res.status(201).json({ 
    workflow: {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      createdAt: workflow.createdAt,
    },
    message: 'Workflow created successfully',
  });
}));

// PUT /api/workflows/:id - Update workflow
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const workflow = await Workflow.findOneAndUpdate(
    { id },
    { ...updates, updatedAt: new Date() },
    { new: true }
  );

  if (!workflow) {
    throw new AppError('Workflow not found', 404);
  }

  res.json({ 
    workflow: {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
    },
    message: 'Workflow updated successfully',
  });
}));

// DELETE /api/workflows/:id - Delete workflow
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const workflow = await Workflow.findOneAndDelete({ id });

  if (!workflow) {
    throw new AppError('Workflow not found', 404);
  }

  res.json({ 
    message: 'Workflow deleted successfully',
  });
}));

// POST /api/workflows/:id/execute - Execute workflow
router.post('/:id/execute', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { initialData } = req.body;
  
  const workflow = await Workflow.findOne({ id });

  if (!workflow) {
    throw new AppError('Workflow not found', 404);
  }

  // Execute workflow
  const execution = await workflowEngine.executeWorkflow(
    id,
    workflow.nodes,
    workflow.edges,
    initialData
  );

  res.json({ 
    executionId: execution.id,
    status: execution.status,
    startTime: execution.startTime,
  });
}));

// GET /api/workflows/:id/executions - Get execution history
router.get('/:id/executions', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const executions = workflowEngine.getAllExecutions(id);

  res.json({ 
    executions,
    count: executions.length,
  });
}));

// ============================================
// Dify Integration Endpoints
// ============================================

// POST /api/workflows/dify/execute - Execute Dify workflow
router.post('/dify/execute', asyncHandler(async (req, res) => {
  const { inputs, userId = 'anonymous', responseMode = 'blocking', workflowId } = req.body;
  
  if (!inputs) {
    throw new AppError('Inputs are required', 400);
  }

  const result = await difyService.executeWorkflow(
    inputs,
    userId,
    responseMode,
    workflowId
  );

  res.json({ 
    success: true,
    data: result,
    message: 'Dify workflow executed successfully',
  });
}));

// GET /api/workflows/dify/status/:taskId - Get Dify workflow status
router.get('/dify/status/:taskId', asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  
  const status = await difyService.getWorkflowStatus(taskId);

  res.json({ 
    success: true,
    data: status,
  });
}));

// POST /api/workflows/dify/stop/:taskId - Stop Dify workflow
router.post('/dify/stop/:taskId', asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { userId = 'anonymous' } = req.body;
  
  const result = await difyService.stopWorkflow(taskId, userId);

  res.json({ 
    success: true,
    data: result,
    message: 'Dify workflow stopped',
  });
}));

// GET /api/workflows/dify/info - Get Dify app info
router.get('/dify/info', asyncHandler(async (req, res) => {
  const info = await difyService.getAppInfo();

  res.json({ 
    success: true,
    data: info,
  });
}));

// GET /api/workflows/dify/parameters - Get Dify app parameters
router.get('/dify/parameters', asyncHandler(async (req, res) => {
  const parameters = await difyService.getAppParameters();

  res.json({ 
    success: true,
    data: parameters,
  });
}));

// POST /api/workflows/dify/upload - Upload file to Dify
router.post('/dify/upload', asyncHandler(async (req, res) => {
  const { userId = 'anonymous' } = req.body;
  
  if (!req.file) {
    throw new AppError('File is required', 400);
  }

  const result = await difyService.uploadFile(
    req.file.buffer,
    req.file.originalname,
    userId
  );

  res.json({ 
    success: true,
    data: result,
    message: 'File uploaded successfully',
  });
}));

// GET /api/workflows/dify/health - Check Dify service health
router.get('/dify/health', asyncHandler(async (req, res) => {
  const isHealthy = await difyService.healthCheck();
  const config = difyService.getConfig();

  res.json({ 
    success: true,
    healthy: isHealthy,
    config,
    message: isHealthy ? 'Dify service is available' : 'Dify service is not available',
  });
}));

export default router;
