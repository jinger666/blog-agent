import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { MemorySearchRequest, SearchResult, ApiResponse } from '@ai-blog/types';

@Controller('api/memory')
export class MemoryController {
  @Post('search')
  async search(@Body() searchDto: MemorySearchRequest): Promise<ApiResponse<SearchResult[]>> {
    return {
      success: true,
      data: [],
    };
  }

  @Get('stats')
  getStats() {
    return { total: 0 };
  }
}
