import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Infrastructure modules
import { DatabaseModule } from './modules/database/database.module';
import { RedisModule } from './modules/redis/redis.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { AgentModule } from './modules/agent/agent.module';
import { MemoryModule } from './modules/memory/memory.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { RAGModule } from './modules/rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    AgentModule,
    MemoryModule,
    WorkflowModule,
    RAGModule,
  ],
})
export class AppModule {}
