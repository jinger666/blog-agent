import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import agentRoutes from './api/routes/agent.routes';
import memoryRoutes from './api/routes/memory.routes';
import workflowRoutes from './api/routes/workflow.routes';
import ragRoutes from './api/routes/rag.routes';
import authRoutes from './api/routes/auth.routes';
import { initializeAdditionalTools } from './tools/textTools';
import { initializeDocumentTools } from './tools/documentTools';
import { initializeSkills } from './agent/skills/blogSkills';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/agent', agentRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();

    // Initialize tools and skills
    initializeAdditionalTools();
    initializeDocumentTools();
    initializeSkills();
    logger.info('✅ All tools and skills initialized');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📝 API routes: /api/agent, /api/memory, /api/rag, /api/workflows`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();

export default app;
