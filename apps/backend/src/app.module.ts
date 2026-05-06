import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Infrastructure modules
import { DatabaseModule } from './modules/database/database.module';
import { RedisModule } from './modules/redis/redis.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    // TODO: Add more modules as they are implemented
    // AgentModule,
    // MemoryModule,
    // WorkflowModule,
    // RAGModule,
  ],
})
export class AppModule {}
