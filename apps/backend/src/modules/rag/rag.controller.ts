import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('api/rag')
export class RagController {
  constructor(private ragService: RagService) {}

  @Post('index')
  async indexDocument(@Body() body: any) {
    const { content, metadata, type } = body;

    if (!content) {
      return { success: false, error: 'Document content is required' };
    }

    try {
      const result = await this.ragService.indexDocument(content, metadata, type);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post('query')
  async query(@Body() body: any) {
    const { query, topK = 5 } = body;

    if (!query) {
      return { success: false, error: 'Query text is required' };
    }

    try {
      const result = await this.ragService.query(query, topK);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Delete('documents/:id')
  async removeDocument(@Param('id') id: string) {
    try {
      const result = await this.ragService.removeDocument(id);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const result = await this.ragService.getStats();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
