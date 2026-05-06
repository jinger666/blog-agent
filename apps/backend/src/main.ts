import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { logger } from './utils/logger';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { initializeAdditionalTools } from './tools/textTools';
import { initializeDocumentTools } from './tools/documentTools';
import { initializeSkills } from './agent/skills/blogSkills';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global rate limiting
  app.useGlobalInterceptors(new RateLimitInterceptor());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Compression
  const compression = require('compression');
  app.use(compression());

  // Security headers
  const helmet = require('helmet');
  app.use(helmet());

  // Body parsing
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  // Initialize tools and skills
  initializeAdditionalTools();
  initializeDocumentTools();
  initializeSkills();
  logger.info('✅ All tools and skills initialized');

  // Health check endpoint
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AI Blog Platform API')
      .setDescription('API documentation for AI Blog Platform - Pure Nest.js')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.info(`🚀 Backend server running on http://localhost:${port}`);
  logger.info(`📚 API Docs available at http://localhost:${port}/api/docs`);
  logger.info(`🔧 Pure Nest.js architecture (no Express hybrid)`);
}

bootstrap().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
