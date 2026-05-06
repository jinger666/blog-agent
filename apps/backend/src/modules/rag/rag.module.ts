import { Module } from '@nestjs/common';
import { RAGController } from './rag.controller';

@Module({
  controllers: [RAGController],
})
export class RAGModule {}
