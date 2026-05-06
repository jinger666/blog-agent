import { Controller, Post, Body } from '@nestjs/common';
import { RAGQueryRequest, RAGQueryResult, ApiResponse } from '@ai-blog/types';

@Controller('api/rag')
export class RAGController {
  @Post('query')
  async query(@Body() queryDto: RAGQueryRequest): Promise<ApiResponse<RAGQueryResult>> {
    return {
      success: true,
      data: {
        chunks: [],
        answer: 'RAG response placeholder',
      },
    };
  }
}
