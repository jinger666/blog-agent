import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MemoryService } from './memory.service';

@Controller('api/memory')
export class MemoryController {
  constructor(private memoryService: MemoryService) {}

  @Get('search')
  async searchMemories(
    @Query('userId') userId = 'anonymous',
    @Query('q') query: string,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
  ) {
    if (!query) {
      return { success: false, error: 'Search query is required' };
    }

    try {
      const result = await this.memoryService.searchMemories(
        userId,
        query,
        parseInt(limit as string),
        category
      );
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post('store')
  async storeMemory(@Body() body: any) {
    const { content, category, userId = 'anonymous', metadata } = body;

    if (!content || !category) {
      return { success: false, error: 'Content and category are required' };
    }

    try {
      const result = await this.memoryService.storeMemory(content, category, userId, metadata);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Put(':id')
  async updateMemory(@Param('id') id: string, @Body() updates: any) {
    try {
      const result = await this.memoryService.updateMemory(id, updates);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Delete(':id')
  async deleteMemory(@Param('id') id: string) {
    try {
      const result = await this.memoryService.deleteMemory(id);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('stats')
  async getStats(@Query('userId') userId = 'anonymous') {
    try {
      const result = await this.memoryService.getMemoryStats(userId);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
